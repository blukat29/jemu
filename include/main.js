
"use strict";

var last_instruction = null;
var editor;
var source_code;
var exe_text;
var exe_text_end;
var memory;
var emulator;
var regs = {};
var run_id;

var esp_pointer = '<span id="ptr-esp">esp</span>';
var ebp_pointer = ' <span id="ptr-ebp">ebp</span>';

function int_to_hexstr(n) {
  var pad = "00000000";
  return "0x" + (pad + n.toString(16)).slice(-8);
}

function byte_to_hexstr(n) {
  if (n == 0) return "00";
  if (n < 0x10) return "0" + n.toString(16);
  return n.toString(16);
}

function get_source_code() {
  source_code = editor.getValue('\n');
  return source_code;
}

function update_registers() {
  regs = emulator.registers;
  /* Display general purpose registers */
  var names = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp"];
  for (var i=0; i<names.length; i++) {
    var name = names[i];
    $("#reg-" + name).html(int_to_hexstr(regs[name].get()));
  }

  /* Display real EIP */
  var real_eip = get_instruction_at(regs.eip.get()).addr;
  $("#reg-eip").html(int_to_hexstr(real_eip));

  /* Display EFLAGS */
  var flags = [["flagCarry","C"], ["flagZ","Z"], ["flagSign", "S"], ["flagOv", "O"]];
  var flag_output = "";
  for (var i=0; i<flags.length; i++) {
    var original = flags[i][0];
    var display = flags[i][1];
    flag_output += "<b>" + display + "</b>:" + emulator.context[original] + " ";
  }
  $("#reg-flags").html(flag_output);
}

function get_instruction_at(addr) {
  if (0x8048000 <= addr && addr < exe_text_end) {
    var index = (addr - 0x8048000) / 4;
    return exe_text[index];
  }
  return null;
}

function show_stack() {
  var base = 0xc0000000 - 0x80;
  var limit = 0xc0000000;
  var e = $("#mem-stack");
  var sp = regs.esp.get();
  var bp = regs.ebp.get();
  e.html("");
  for (var addr = limit - 4; addr >= base; addr -= 4) {

    var value = memory.get(addr, 4);
    var instr = get_instruction_at(value);
    if (instr)
      value = instr.addr;

    var head = $('<td class="mem-head"></td>').html(int_to_hexstr(addr));
    var cell = $('<td class="mem-cell"></td>').html(int_to_hexstr(value));
    if (sp <= addr && addr < bp + 4) {
      head.addClass("mem-frame");
      cell.addClass("mem-frame");
    }

    var sp_ptr = '<td></td>'
    var bp_ptr = '<td></td>'
    if (sp <= addr && addr < sp + 4)
      sp_ptr = '<td class="mem-ptr ptr-esp">esp</td>';
    else if (sp + 4 <= addr && addr <= bp)
      sp_ptr = '<td class="mem-ptr ptr-esp-delta">esp+0x' + (addr - sp).toString(16) + '</td>';

    if (bp <= addr && addr < bp + 4)
      bp_ptr = '<td class="mem-ptr ptr-ebp">ebp</td>';
    else if (sp <= addr && addr < bp)
      bp_ptr = '<td class="mem-ptr ptr-ebp-delta">ebp-0x' + (bp - addr).toString(16) + '</td>';
    else if (bp + 4 <= addr && addr < bp + 16)
      bp_ptr = '<td class="mem-ptr ptr-ebp-delta">ebp+0x' + (addr - bp).toString(16) + '</td>';

    var tr = $('<tr></tr>');
    if (addr < sp) tr.addClass('text-muted');
    tr.append(head).append(cell).append(sp_ptr).append(bp_ptr);
    e.append(tr);
  }
}

function mark_current_instruction() {
  if (last_instruction != null)
    editor.removeLineClass(last_instruction, "background", "current-instruction");
  var index = get_instruction_at(regs.eip.get()).index;
  last_instruction = index;
  editor.addLineClass(index, "background", "current-instruction");
}

function update_context() {
  update_registers();
  show_stack();
  mark_current_instruction();
}

function assemble_error(msg, line) {
  console.log('Assemble error: ' + msg + ' in line ' + line);
}

function run_pasm() {
  var code = get_source_code();

  /* Tell Pasm about architecture. */
  code = "[bits 32]\n[org 0x8048000]\n" + code;

  /* NASM syntax does not have "ptr" after size specifier. */
  code = code.replace("byte ptr", "byte")
             .replace("word ptr", "word")
             .replace("dword ptr", "dword")
             .replace("qword ptr", "qword");

  var result = pasm.parse(code);

  var addr = 0x8048000;
  exe_text = [];
  for (var i in result.lines) {
    var bytes = [];
    var str = result.lines[i].final;
    while (str.length > 0) {
      bytes.push(parseInt(str.substring(0,2), 16));
      str = str.substring(2);
    }
    var instr = {
      bytes: bytes,
      addr: addr,
      index: i-2   // Two lines for [bits 32] and [org 0x8048000].
    };
    exe_text.push(instr);
    var gutter = $('<span class="text-address-gutter"></span>').html(int_to_hexstr(addr));
    editor.setGutterMarker(i-2, "text-address", gutter[0]);

    addr += bytes.length;
  }
  exe_text_end = addr + 4 * exe_text.length;
}

function compile_code() {
  var code = get_source_code();

  /* Dirty fix to accept negative displacement inside memory operand. */
  /* Asm86Compiler (unfortunately) uses this grammar:
   *     MemoryOperand: [ REG + REG * (2|4|8) + IMM ]
   *     IMM: -123, 0x8888, 0b110011101 ...
   * So we have to write like [ecx+-4] instead of [ecx-4] */
  var i = 0;
  var insideComment = false;
  var bracketLevel = 0;
  var revised_code = "";
  for (var i=0; i < code.length; i++) {
    var c = code.charAt(i);
    if (c == '\n') insideComment = false;
    else if (c == ';') {
      insideComment = true;
      bracketLevel = 0;
    }
    else if (c == '[') bracketLevel ++;
    else if (c == ']') bracketLevel --;
    else if (c == '-' && bracketLevel > 0 && !insideComment) {
      c = '+-';
    }
    revised_code += c;
  }

  emulator.compile(revised_code);
}

function allow_edit_code() {
  editor.setOption("readOnly", false);
  $(".CodeMirror-code").css("background-color", "#ffffff");
  $("#btn-assemble").removeClass("disabled");
  $("#btn-reset").addClass("disabled");
  $("#btn-step").addClass("disabled");
  $("#btn-run").addClass("disabled");
  $("#btn-pause").addClass("disabled");
}

function assemble_code() {
  run_pasm();
  editor.setOption("readOnly", true);
  $(".CodeMirror-code").css("background-color", "#f5f5f5");
  $("#btn-edit").removeClass("disabled")
  $("#btn-assemble").removeClass("disabled");
  $("#btn-reset").removeClass("disabled");
  $("#btn-step").addClass("disabled");
  $("#btn-run").addClass("disabled");
}

function reset_emulator() {
  compile_code();
  emulator.reset();
  update_context();
  $("#btn-step").removeClass("disabled");
  $("#btn-run").removeClass("disabled");
}

function step_emulator() {
  emulator.step();
  update_context();
}

function run_emulator() {
  run_id = setInterval(step_emulator, 100);
  $("#btn-assemble").addClass("disabled");
  $("#btn-reset").addClass("disabled");
  $("#btn-step").addClass("disabled");
  $("#btn-run").addClass("disabled");
  $("#btn-pause").removeClass("disabled");
}

function pause_emulator() {
  clearInterval(run_id);
  $("#btn-assemble").removeClass("disabled");
  $("#btn-reset").removeClass("disabled");
  $("#btn-step").removeClass("disabled");
  $("#btn-run").removeClass("disabled");
  $("#btn-pause").addClass("disabled");
}

function set_emulator_callbacks() {
  emulator.onCompilationError.attach(function(emulator, msg, line, lineIdx, idx) {
    console.log("compile error " + msg + " at " + line);
  });
}

function load_example() {
  var filename = $("#select-example").val();
  if (filename == "") return;
  $.ajax({
    url: "example/" + filename,
  }).done(function(data) {
    editor.setValue(data);
    pause_emulator();
    allow_edit_code();
  });
}

$(document).ready(function() {

  editor = CodeMirror.fromTextArea($("#source-code")[0], {
    gutters: ["CodeMirror-linenumbers", "text-address"],
    lineNumbers: true
  });

  window.Opcode.error = assemble_error;
  pasm.parseError = assemble_error;

  memory = new VirtualMemory();
  emulator = new Asm86Emulator(memory);
  set_emulator_callbacks();

  $("#btn-edit").click(allow_edit_code);
  $("#btn-assemble").click(assemble_code);
  $("#btn-reset").click(reset_emulator);
  $("#btn-step").click(step_emulator);
  $("#btn-run").click(run_emulator);
  $("#btn-pause").click(pause_emulator);
  $("#btn-example").click(load_example);
});

