#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Suppress dotenv/dotenvx console messages
process.env.DOTENV_CONFIG_SILENT = 'true';

// Use dotenv to load .env file (silent mode)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get PORT from environment or default to 3001
const port = process.env.PORT || '3001';

// Start Next.js with the PORT
const args = ['dev', '-p', port];
const child = spawn('next', args, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, DOTENV_CONFIG_SILENT: 'true' }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
