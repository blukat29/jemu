
"use strict";

var exe_text;
var emulator;

function int_to_hexstr(n) {
  var pad = "00000000";
  return "0x" + (pad + n.toString(16)).slice(-8);
}

function get_source_code() {
  return $("#source-code").val();
}

function update_registers() {
  var regs = emulator.registers;
  var names = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp", "eip"];
  for (var i=0; i<names.length; i++) {
    var name = names[i];
    $("#reg-" + name).html(int_to_hexstr(regs[name].get()));
  }
  var flags = [["flagCarry","C"], ["flagZ","Z"], ["flagSign", "S"], ["flagOv", "O"]];
  var flag_output = "";
  for (var i=0; i<flags.length; i++) {
    var original = flags[i][0];
    var display = flags[i][1];
    flag_output += "<b>" + display + "</b>:" + emulator.context[original] + " ";
  }
  $("#reg-flags").html(flag_output);
}

function assemble_error(msg, line) {
  console.log('Assemble error: ' + msg + ' in line ' + line);
}

function assemble_code() {
  var code = get_source_code();

  /* Tell Pasm about architecture. */
  code = "[bits 32]\n" + code;

  /* NASM syntax does not have "ptr" after size specifier. */
  code = code.replace("byte ptr", "byte")
             .replace("word ptr", "word")
             .replace("dword ptr", "dword")
             .replace("qword ptr", "qword");

  var result = pasm.parse(code);
  console.log(result);
  exe_text = result.data;
}

function reset_emulator() {
  var code = get_source_code();
  emulator.compile(code);
  emulator.reset();
  update_registers();
}

function step_emulator() {
  emulator.step();
  update_registers();
}

$(document).ready(function() {

  window.Opcode.error = assemble_error;
  pasm.parseError = assemble_error;

  emulator = new Asm86Emulator(16 * 1024);

  $("#btn-assemble").click(assemble_code);
  $("#btn-reset").click(reset_emulator);
  $("#btn-step").click(step_emulator);
});

