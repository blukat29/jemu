"use strict";

function VirtualMemory() {
  this.sections = [
      { base: 0x08048000, size: 0x100 },         // LOAD
      { base: 0xc0000000 - 0x100, size: 0x100 }  // GNU_STACK
  ];
  this.initialStackPointer = 0xc0000000 - 4;
  this.codeBase = 0x08048000;

  this.ramSize = 0;
  for (var i=0; i<this.sections.length; i++) {
    this.ramSize += this.sections[i].size;
  }
  this.ram = new DataView(new ArrayBuffer(this.ramSize));

  this._translateAddress = function(address, size) {
    for (var i=0; i<this.sections.length; i++) {
      var base = this.sections[i].base;
      var limit = base + this.sections[i].size;
      if (base <= address && address + size < limit) {
        return (address - base);
      }
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
}

