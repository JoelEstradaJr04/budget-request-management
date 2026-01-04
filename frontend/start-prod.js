#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Use dotenv to load .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get PORT from environment or default to 3001
const port = process.env.PORT || '3001';

console.log(`Starting Next.js production server on port ${port}...`);

// Start Next.js with the PORT
const args = ['start', '-p', port];
const child = spawn('next', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
