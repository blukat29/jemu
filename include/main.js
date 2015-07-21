
"use strict";
var editor;
var jemu;
var run_id = null;

function reset_emulator() {
  jemu.assemble(get_source_code());
  update_context();
  clearInterval(run_id);
  $("#btn-step").removeClass("disabled").addClass("btn-primary");
  $("#btn-run").removeClass("disabled").addClass("btn-success");
}

function step_emulator() {
  jemu.step();
  update_context();
  if (jemu.emulator.isHalted())
    clearInterval(run_id);
}

function run_emulator() {
  run_id = setInterval(step_emulator, 50);
  $("#btn-step").addClass("disabled");
  $("#btn-run").addClass("disabled");
  $("#btn-pause").removeClass("disabled");
}

function pause_emulator() {
  clearInterval(run_id);
  $("#btn-reset").removeClass("disabled");
  $("#btn-step").removeClass("disabled");
  $("#btn-run").removeClass("disabled");
  $("#btn-pause").addClass("disabled");
}

$(document).ready(function() {

  editor = CodeMirror.fromTextArea($("#source-code")[0], {
    gutters: ["CodeMirror-linenumbers", "text-address"],
    lineNumbers: true
  });

  function assemble_error(msg, line) {
    console_out('Assemble error: ' + msg + ' in line ' + line + '\n');
  }
  window.Opcode.error = assemble_error;
  pasm.parseError = assemble_error;

  jemu = new Jemu(console_in, console_out);

  $("#btn-reset").click(reset_emulator);
  $("#btn-step").click(step_emulator);
  $("#btn-run").click(run_emulator);
  $("#btn-pause").click(pause_emulator);
  $("#select-example").change(load_example);
});

