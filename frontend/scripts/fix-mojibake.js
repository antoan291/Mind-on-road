
const fs = require(''fs'');
const files = process.argv.slice(2);
if (!files.length) process.exit(1);
const m = new Map([
  [''\\u20AC'',0x80],[''\\u201A'',0x82],[''\\u0192'',0x83],[''\\u201E'',0x84],[''\\u2026'',0x85],[''\\u2020'',0x86],[''\\u2021'',0x87],
