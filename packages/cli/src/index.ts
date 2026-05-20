#!/usr/bin/env node

import { Command } from 'commander';
import { Orchestrator, OllamaProvider } from '@kgent/core';

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

program.command('task <description>')
  .description('Execute a task using the Kgent Orchestrator')
  .option('--ollama-url <url>', 'Base URL for Ollama API', 'http://127.0.0.1:11434')
  .option('--ollama-model <model>', 'Ollama model to use', 'llama3')
  .action(async (description, options) => {
    try {
      console.log(`Initializing Kgent with Ollama at ${options.ollamaUrl} (Model: ${options.ollamaModel})`);
      const provider = new OllamaProvider(options.ollamaUrl, options.ollamaModel);

      const orchestrator = new Orchestrator([provider]);
      const result = await orchestrator.executeTask(description);

      console.log('\n--- Final Result ---');
      console.log(result);
      console.log('--------------------');
    } catch (err) {
      console.error('Task execution failed:', err);
      process.exit(1);
    }
  });

program.parse(process.argv);
