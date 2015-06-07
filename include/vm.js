"use strict";

function VirtualMemory() {
  this.sections = [
      { base: 0x08048000, size: 0x100, name: "LOAD" },
      { base: 0xc0000000 - 0x80, size: 0x80, name: "STACK" }
  ];
  this.initialStackPointer = 0xc0000000 - 4;
  this.codeBase = 0x08048000;

  this.ramSize = 0;
  for (var i=0; i<this.sections.length; i++) {
    this.ramSize += this.sections[i].size;
  }
  this.ram = new DataView(new ArrayBuffer(this.ramSize));

  this._translateAddress = function(address, size) {
    var ramOffset = 0;
    for (var i=0; i<this.sections.length; i++) {
      var base = this.sections[i].base;
      var sector_size = this.sections[i].size;
      var limit = base + sector_size;
      if (base <= address && address + size < limit) {
        return (address - base + ramOffset);
      }
      ramOffset += sector_size;
    }
    return null;
  };

  this.set = function(address, value, size) {
    var physicalAddr = this._translateAddress(address, size);
    if (physicalAddr) {
      switch (size) {
        case 1:
          this.ram.setUint8(physicalAddr, value);
          return true;
        case 2:
          this.ram.setUint16(physicalAddr, value, true);
          return true;
        case 4:
          this.ram.setUint32(physicalAddr, value, true);
          return true;
      }
    }
    return false;
  }

  this.get = function(address, size) {
    var physicalAddr = this._translateAddress(address, size);
    if (physicalAddr) {
      switch (size) {
        case 1:
          return this.ram.getUint8(physicalAddr);
        case 2:
          return this.ram.getUint16(physicalAddr, true);
        case 4:
          return this.ram.getUint32(physicalAddr, true);
      }
    }
    return null;
  }

  this.reset = function() {
    for (var i=0; i<this.ramSize; i++) {
      this.ram.setUint8(i, 0);
    }
  }

  this.dump = function() {
    var ramOffset = 0;
    var capture = {};
    for (var i=0; i<this.sections.length; i++) {
      var base = this.sections[i].base;
      var size = this.sections[i].size;
      var name = this.sections[i].name;
      var array = new Uint8Array(this.ram.buffer, ramOffset, size);
      capture[name] = {
        base: base,
        size: size,
        data: array
      };
      ramOffset += size;
    }
    return capture;
  }
}

