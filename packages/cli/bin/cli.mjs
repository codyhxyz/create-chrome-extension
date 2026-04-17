#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_URL = process.env.CCE_REPO_URL || 'https://github.com/your-org/cce-factory.git';

function usage() {
  console.log(`Usage: create-chrome-extension <project-name> [flags]

Clone the Chrome Extension Factory into ./<project-name>/, install deps,
and register the /cce-init skill in Claude Code.

Flags:
  --skip-install   Skip "npm install"
  --skip-skill     Skip "npx skills add"
  --help           Show this message

After the scaffold finishes, open the project in Claude Code and run /cce-init.`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) {
    console.error(`\nCommand failed: ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  const positional = argv.filter((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));

  if (positional.length !== 1) {
    console.error('Error: exactly one project name required.\n');
    usage();
    process.exit(1);
  }

  const name = positional[0];
  const target = resolve(process.cwd(), name);

  if (existsSync(target)) {
    console.error(`Error: ${target} already exists. Pick a different name or remove it.`);
    process.exit(1);
  }

  console.log(`Cloning factory into ${target}...`);
  run('git', ['clone', '--depth', '1', REPO_URL, target]);
  run('rm', ['-rf', resolve(target, '.git')]);
  run('git', ['init', '--quiet'], { cwd: target });

  if (!flags.has('--skip-install')) {
    console.log('\nInstalling dependencies...');
    run('npm', ['install'], { cwd: target });
  } else {
    console.log('\nSkipped npm install (--skip-install).');
  }

  if (!flags.has('--skip-skill')) {
    console.log('\nInstalling /cce-init skill into Claude Code...');
    const r = spawnSync('npx', ['skills', 'add', REPO_URL], { stdio: 'inherit' });
    if (r.status !== 0) {
      console.log('(Skill install skipped — run `npx skills add <repo>` manually if you use Claude Code.)');
    }
  } else {
    console.log('\nSkipped skill install (--skip-skill).');
  }

  console.log(`
Done. Next steps:

  cd ${name}
  npm run dev        # start dev server
  Open in Claude Code and run:  /cce-init

The /cce-init skill asks about your extension, strips the factory to match,
and generates tailored first-run code.
`);
}

main(process.argv.slice(2));
