import { createInterface } from 'node:readline';

export async function ask(question, { input = process.stdin, output = process.stdout } = {}) {
  const rl = createInterface({ input, output, terminal: false });

  output.write(`  ${question}\n`);
  output.write('  (Empty line to finish)\n\n');
  output.write('  > ');

  const lines = [];

  for await (const raw of rl) {
    const line = raw.trim();
    if (line === '') break;
    lines.push(line);
    output.write('  > ');
  }

  rl.close();
  return lines.join('\n');
}
