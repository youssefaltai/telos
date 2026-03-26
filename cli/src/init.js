import fs from 'node:fs';
import * as clack from '@clack/prompts';
import { generateIntent } from './generate-intent.js';
import { writeProject } from './write-project.js';

export function isDirEmpty(dir) {
  const entries = fs.readdirSync(dir);
  return entries.every((entry) => entry === '.git');
}

export async function init(targetDir) {
  clack.intro('telos');

  if (!isDirEmpty(targetDir)) {
    clack.cancel('This directory is not empty. Telos init works in empty directories only.');
    return false;
  }

  const answers = await clack.group(
    {
      building: () =>
        clack.text({
          message: 'What are you building?',
          placeholder: 'A web app that...',
          validate: (value) => {
            if (!value.trim()) return 'Please describe what you are building.';
          },
        }),
      success: () =>
        clack.text({
          message: 'What does success look like?',
          placeholder: 'Users can...',
          validate: (value) => {
            if (!value.trim()) return 'Please describe what success looks like.';
          },
        }),
      nonGoals: () =>
        clack.text({
          message: 'Anything explicitly out of scope?',
          placeholder: 'Press enter to skip',
        }),
    },
    {
      onCancel: () => {
        clack.cancel('Init cancelled.');
        process.exit(0);
      },
    },
  );

  const intentContent = generateIntent({
    building: answers.building.trim(),
    success: answers.success.trim(),
    nonGoals: answers.nonGoals?.trim() || '',
  });
  writeProject(targetDir, intentContent);

  clack.log.success('Telos initialized.');
  clack.outro('Your intent is in INTENT.md — open Claude Code and say: Read CLAUDE.md and begin.');
}
