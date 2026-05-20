#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
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
