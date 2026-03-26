#!/usr/bin/env node

import { init } from '../src/init.js';

const command = process.argv[2];

if (command === 'init') {
  init(process.cwd());
} else {
  console.log('Usage: agentix init');
  process.exit(1);
}
