import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, '..', 'templates');

const TEMPLATE_FILES = [
  { src: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { src: '.claude/agents/meta-agent.md', dest: '.claude/agents/meta-agent.md' },
  { src: 'gitignore', dest: '.gitignore' },
];

export function writeProject(targetDir, intentContent) {
  fs.writeFileSync(path.join(targetDir, 'INTENT.md'), intentContent);

  for (const { src, dest } of TEMPLATE_FILES) {
    const destPath = path.join(targetDir, dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(path.join(TEMPLATES, src), destPath);
  }
}
