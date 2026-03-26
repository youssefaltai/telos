import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(__dirname, '..', 'templates');

const TEMPLATE_FILES = [
  { src: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { src: 'CONSTITUTION.md', dest: 'CONSTITUTION.md' },
  { src: 'PHILOSOPHY.md', dest: 'PHILOSOPHY.md' },
  { src: 'gitignore', dest: '.gitignore' },
  { src: 'bootstrap/meta-agent.md', dest: 'bootstrap/meta-agent.md' },
  { src: 'agents/core.md', dest: 'agents/core.md' },
];

const EMPTY_DIRS = ['checkpoints', 'logs', 'memory'];

export function writeProject(targetDir, intentContent) {
  // Write INTENT.md from generated content
  fs.writeFileSync(path.join(targetDir, 'INTENT.md'), intentContent);

  // Copy template files
  for (const { src, dest } of TEMPLATE_FILES) {
    const destPath = path.join(targetDir, dest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(path.join(TEMPLATES, src), destPath);
  }

  // Create empty directories with .gitkeep
  for (const dir of EMPTY_DIRS) {
    const dirPath = path.join(targetDir, dir);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '');
  }
}
