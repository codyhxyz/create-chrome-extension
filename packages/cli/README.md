# create-chrome-extension

Scaffold a [Chrome Extension Factory](https://github.com/<your-org>/cce-factory) project in one command.

## Usage

```bash
npx create-chrome-extension my-extension
cd my-extension
# Open in Claude Code and run /cce-init
```

## What it does

1. Clones the factory template into `./my-extension/`
2. Runs `npm install`
3. Installs the `/cce-init` skill into Claude Code (if available)
4. Prints next-step instructions

## Flags

- `--skip-install` — skip `npm install`
- `--skip-skill` — skip the `npx skills add` step
- `--help` — print usage

## Requirements

- Node >= 20
- git
