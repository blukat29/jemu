
"use strict";

var last_instruction = null;
var editor;
var source_code;
var exe_text;
var exe_text_end;
var memory;
var emulator;
var regs = {};

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

function memory_pointer(addr) {
  var result = "";
  var sp = regs.esp.get();
  var bp = regs.ebp.get();
  if (sp <= addr && addr < sp + 4) result += esp_pointer;
  if (bp <= addr && addr < bp + 4) result += ebp_pointer;
  if (sp + 4 <= addr && addr < bp)
    return null;
  return result;
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
  e.html("");
  for (var addr = limit - 4; addr >= base; addr -= 4) {
    var value = memory.get(addr, 4);
    var instr = get_instruction_at(value);
    if (instr)
      value = instr.addr;
    var head = $('<div class="mem-head"></div>').html(int_to_hexstr(addr));
    var cell = $('<div class="mem-cell"></div>').html(int_to_hexstr(value));
    var ptr = $('<div class="mem-ptr"></div>').html(memory_pointer(addr) || "&nbsp;");
    var tr = $('<div></div>');
    tr.append(head).append(cell).append(ptr);
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

function assemble_code() {
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

function reset_emulator() {
  compile_code();
  emulator.reset();
  update_context();
}

function step_emulator() {
  emulator.step();
  update_context();
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

  $("#btn-assemble").click(assemble_code);
  $("#btn-reset").click(reset_emulator);
  $("#btn-step").click(step_emulator);
  $("#btn-example").click(load_example);
});

