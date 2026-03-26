import { createInterface } from 'node:readline';

/**
 * Ask a question and collect multiline input until an empty line.
 *
 * opts:
 *   input   - Readable stream (default: process.stdin)
 *   output  - Writable stream (default: process.stdout)
 *   lines   - string[] queue; if provided, consume from it instead of the stream
 *   rl      - shared readline interface; if provided, reuse it instead of creating one
 */
export async function ask(question, { input = process.stdin, output = process.stdout, lines, rl: sharedRl } = {}) {
  output.write(`  ${question}\n`);
  output.write('  (Empty line to finish)\n\n');
  output.write('  > ');

  const result = [];

  if (lines) {
    // Consume from pre-buffered line queue (test/pipe mode)
    while (lines.length > 0) {
      const raw = lines.shift();
      const line = raw.trim();
      if (line === '') break;
      result.push(line);
      output.write('  > ');
    }
  } else {
    // Use shared or new readline interface
    const rl = sharedRl || createInterface({ input, output, terminal: false });

    for await (const raw of rl) {
      const line = raw.trim();
      if (line === '') break;
      result.push(line);
      output.write('  > ');
    }

    if (!sharedRl) rl.close();
  }

  return result.join('\n');
}

/**
 * Read all lines from a Readable stream into an array.
 */
export async function readAllLines(input) {
  const rl = createInterface({ input, terminal: false });
  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }
  rl.close();
  return lines;
}
