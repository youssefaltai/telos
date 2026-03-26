#!/usr/bin/env node

import { init } from '../src/init.js';

const command = process.argv[2];

if (command === 'init') {
  init(process.cwd()).then((ok) => { if (ok === false) process.exitCode = 1; });
} else {
  console.log('Usage: telos init');
  process.exit(1);
}
