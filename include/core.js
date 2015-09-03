
"use strict";

function Jemu(console_in, console_out) {
  this.console_in = console_in;
  this.console_out = console_out;
  this.memory = new VirtualMemory();
  this.emulator = new Asm86Emulator(this.memory);
  this.text = [];
  this.text_end = 0;
  this.run_id = null;

  /* Set Asm86 callbacks */
  this.emulator.onCompilationError.attach(function(emulator, msg, line, lineIdx, idx) {
    console_out('Assemble error: ' + msg + ' in line ' + line + '\n');
  });
  this.emulator.onRuntimeError.attach(function(emulator, msg) {
    console_out('Runtime error: ' + msg + '\n');
  });
  Asm86Language.translate(Asm86Language.enMessages, Asm86Language.enUI);
  this.emulator.context.setSyscallHandler(this.syscall_handler);
}

Jemu.prototype = {
  assemblePasm: function(code) {
    /* Tell Pasm about architecture. */
    var revised_code = "[bits 32]\n[org 0x8048000]\n" + code;

    /* NASM syntax does not have "ptr" after size specifier. */
    revised_code = revised_code.replace("byte ptr", "byte")
                               .replace("word ptr", "word")
                               .replace("dword ptr", "dword")
                               .replace("qword ptr", "qword");

    /* Generate machine code */
    var result = pasm.parse(revised_code);

    var addr = 0x8048000;
    this.text = [];
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
      this.text.push(instr);
      addr += bytes.length;
    }
    this.text_end = 0x8048000 + 4 * this.text.length;
  },

  assembleAsm86: function(code) {
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
    /* Let Asm86 to parse the code. */
    if (this.emulator.isCompiled())
      this.emulator.reset();
    this.emulator.compile(revised_code);
  },

  /* Assemble and reset */
  assemble: function(code) {
    this.assemblePasm(code);
    this.assembleAsm86(code);
  },

  step: function() {
    this.emulator.step();
  },

  getRegisters: function() {
    var result = {};
    var raw = this.emulator.registers;

    var names = ["eax", "ebx", "ecx", "edx", "esi", "edi", "esp", "ebp", "eip"];
    for (var i=0; i<names.length; i++) {
      var name = names[i];
      result[name] = raw[name].get();
    }

    var flag_names = [["flagCarry","C"], ["flagZ","Z"], ["flagSign", "S"], ["flagOv", "O"]];
    for (var i=0; i<flag_names.length; i++) {
      var original = flag_names[i][0];
      var display = flag_names[i][1];
      var value = this.emulator.context[original];
      result[display] = value;
    }
    return result;
  },

  /* addr is the fake eip used by Asm86. */
  getInstructionAt: function(addr) {
    if (0x8048000 <= addr && addr < this.text_end) {
      var index = (addr - 0x8048000) / 4;
      return this.text[index];
    }
    return null;
  },

  predictBranch: function(code_lines, regs) {
    var eip = this.emulator.registers.eip.get();
    var inst = this.getInstructionAt(eip);
    if (!inst) return null;
    var line = $.trim(code_lines[inst.index]);
    var opcode = line.split(' ')[0].toLowerCase();
    if (opcode[0] === 'j') {
      var cf=regs.C, zf=regs.Z, sf=regs.S, of=regs.O;
      var taken;
      switch (opcode.substr(1)) {
        case 's' : taken = (sf==1); break;
        case 'ns': taken = (sf==0); break;
        case 'e' : case 'z' : taken = (zf==1); break;
        case 'ne': case 'nz': taken = (zf==0); break;
        case 'c' : case 'b' :  taken = (cf==1); break;
        case 'be': taken = (cf==1 || zf==1); break;
        case 'a' : taken = (cf==0 && zf==0); break;
        case 'l' : taken = (sf!=of); break;
        case 'ge': taken = (sf==of); break;
        case 'le': taken = (zf==1 || sf!=of); break;
        case 'g' : taken = (zf==0 && sf==of); break;
        case 'mp': taken = true; break;
        default: return null;
      }
      return taken;
    }
    else
      return null;
  },

  syscall_handler: function(ctx) {
    var nr = ctx.regs.eax.get();
    var b = ctx.regs.ebx.get();
    var c = ctx.regs.ecx.get();
    var d = ctx.regs.edx.get();

    if (nr === 3) { // SYS_READ(ebx=fd, ecx=addr, edx=size);
      if (b === 0) {
        var data = console_in(d);
        for (var i=0; i<data.length; i++) {
          this.memory.set(c+i, data[i].charCodeAt(0), 1);
        }
        ctx.regs.eax.set(i);
        return;
      }
    }
    if (nr === 4) { // SYS_WRITE(ebx=fd, ecx=addr, edx=size)
      if (b === 1) {
        var s = "";
        for (var i=0; i<d; i++)
          s += String.fromCharCode(this.memory.get(c+i, 1));
        console_out(s);
        ctx.regs.eax.set(d);
        return;
      }
      ctx.regs.eax.set(-1);
      return;
    }
    ctx.regs.eax.set(-1);
    return;
  }
}

