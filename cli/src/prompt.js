import { createInterface } from 'node:readline';

/**
 * Ask a question and collect multiline input until an empty line.
 *
 * opts:
 *   input   - Readable stream (default: process.stdin)
 *   output  - Writable stream (default: process.stdout)
 *   lines   - string[] queue; if provided, consume from it instead of the stream
 */
export async function ask(question, { input = process.stdin, output = process.stdout, lines } = {}) {
  output.write(`  ${question}\n`);
  output.write('  (Empty line to finish)\n\n');
  output.write('  > ');

  const result = [];

  if (lines) {
    // Consume from pre-buffered line queue
    while (lines.length > 0) {
      const raw = lines.shift();
      const line = raw.trim();
      if (line === '') break;
      result.push(line);
      output.write('  > ');
    }
  } else {
    // Create a readline interface over the stream
    const rl = createInterface({ input, output, terminal: false });

    for await (const raw of rl) {
      const line = raw.trim();
      if (line === '') break;
      result.push(line);
      output.write('  > ');
    }

    rl.close();
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
