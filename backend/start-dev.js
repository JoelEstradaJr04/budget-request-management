#!/usr/bin/env node
const { spawn } = require('child_process');

// Suppress dotenv/dotenvx console messages
const child = spawn('tsx', ['watch', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DOTENV_CONFIG_SILENT: 'true' }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
