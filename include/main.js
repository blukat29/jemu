
var source_code;
var exe_text;

function assemble_error(msg, line) {
  console.log('Assemble error: ' + msg + ' in line ' + line);
}

function assemble_code() {
  var code = source_code.val();

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

$(document).ready(function() {

  window.Opcode.error = assemble_error;
  pasm.parseError = assemble_error;

  source_code = $("#source-code");

  $("#btn-assemble").click(assemble_code);
});

