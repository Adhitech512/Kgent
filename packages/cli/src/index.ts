#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('kgent')
  .description('CLI to manage Kgent AI orchestration')
  .version('0.10.0');

program.command('start')
  .description('Start the Kgent daemon and web UI')
  .action(() => {
    console.log('Starting Kgent services...');
  });

program.parse(process.argv);
