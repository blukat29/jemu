
var regs = null;
var old_regs = null;
var last_instruction = null;
var source_lines;
var in_cursor = 0;

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
  var raw = editor.getValue('\n');
  source_lines = raw.split('\n');
  return raw;
}

function show_registers() {
  old_regs = regs || jemu.getRegisters();
  regs = jemu.getRegisters();

  /* Display general purpose registers */
  var names = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp"];
  for (var i=0; i<names.length; i++) {
    var name = names[i];
    var inner = int_to_hexstr(regs[name]);
    var style = (old_regs[name] == regs[name])? "same" : "differ";
      $("#reg-" + name).html('<span class="' + style + '">' + inner + '</span>');
  }

  /* Display real EIP */
  var real_eip = jemu.getInstructionAt(regs.eip).addr;
  $("#reg-eip").html(int_to_hexstr(real_eip));

  /* Display FLAGS */
  var flag_names = ["C", "Z", "S", "O"];
  var flag_output = "";
  for (var i=0; i<flag_names.length; i++) {
    var name = flag_names[i];
    var value = regs[name];
    flag_output += "<b>" + name + "</b>:" + value + " ";
  }
  $("#reg-flags").html(flag_output);
}

function show_branch_prediction() {
  var result = jemu.predictBranch(source_lines, regs);
  var e = $("#branch-prediction");
  if (result === true)
    e.html("jump taken");
  else if (result === false)
    e.html("jump not taken");
  else
    e.html("");
}

function show_stack() {
  var base = 0xc0000000 - 0x80;
  var limit = 0xc0000000;
  var e = $("#mem-stack");
  var sp = regs.esp;
  var bp = regs.ebp;
  e.html("");
  for (var addr = limit - 4; addr >= base; addr -= 4) {

    var value = jemu.memory.get(addr, 4);
    var instr = jemu.getInstructionAt(value);
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

function show_current_instruction() {
  if (last_instruction != null)
    editor.removeLineClass(last_instruction, "background", "current-instruction");
  var index = jemu.getInstructionAt(regs.eip).index;
  last_instruction = index;
  editor.addLineClass(index, "background", "current-instruction");
}

function update_context() {
  show_registers();
  show_stack();
  show_current_instruction();
  show_branch_prediction();
}

function console_out(data) {
  $("#console-out").append(data);
}

function console_in(cnt) {
  var all = $("#console-in").val();
  var cut = all.substr(in_cursor, in_cursor + cnt);
  if (in_cursor + cnt >= all.length)
    in_cursor = all.length;
  else
    in_cursor = in_cursor + cnt;
  return cut;
}

function load_example() {
  var filename = $("#select-example").val();
  if (filename == "") return;
  $.ajax({
    url: "example/" + filename,
  }).done(function(data) {
    editor.setValue(data);
    reset_emulator();
  });
}
