#!/usr/bin/env node

import { Command } from 'commander';
import { Orchestrator, OllamaProvider } from '../core/index';

const program = new Command();

program
  .name('kgent')
  .description('CLI to manage Kgent AI orchestration')
  .version('0.10.2');

import { startServer } from '../server';

program.command('start')
  .description('Start the Kgent backend daemon')
  .action(() => {
    console.log('Starting Kgent backend daemon...');
    startServer();
  });

program.command('task <description>')
  .description('Execute a task using the Kgent Orchestrator')
  .option('--ollama-url <url>', 'Base URL for Ollama API', 'http://127.0.0.1:11434')
  .option('--ollama-models <models>', 'Comma separated list of Ollama models to use for multi-agent mesh', 'llama3')
  .action(async (description, options) => {
    try {
      const models = options.ollamaModels.split(',').map((m: string) => m.trim());
      console.log(`Initializing Kgent with Ollama at ${options.ollamaUrl}. Detected models: ${models.join(', ')}`);

      const providers = models.map((modelName: string) => new OllamaProvider(options.ollamaUrl, modelName));

      const orchestrator = new Orchestrator(providers);
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
