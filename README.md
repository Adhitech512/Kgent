# Kgent (Beta 0.10)

Kgent is a Next-Generation Multi-Agent AI Orchestration Protocol designed for robust, local-first intelligence.
This repository contains the monorepo for the Kgent Core runtime, CLI, and Web interfaces.

## Features (Beta 0.10)
- **Ollama Provider Support**: Seamlessly connect to your local Ollama instance via its REST API.
- **Single-Model Fallback**: Don't want a complex mesh? If you only configure one provider, Kgent gracefully steps down to act as a standard AI agent to save tokens and latency.
- **Smart Context System**: Reduces API costs by intelligently batching JSON payloads when different parts of the system interact with the same model.
- **Fully Offline Database**: Complete data privacy. All memories (Personal, Link, Group, Global) are saved locally using SQLite natively via Node's built-in `node:sqlite`.

## Prerequisites
- Node.js (v20+)
- An active Ollama instance running (locally or remotely).

## Building the Package

```bash
# Install dependencies
npm install

# Build the Core and CLI code
npm run build
```

## Running the Web UI

```bash
cd apps/web
npm run dev
```

## Using the CLI

You can use the Kgent CLI to execute tasks directly from your terminal. By default, it connects to an Ollama instance running at `http://127.0.0.1:11434`.

```bash
# Run a task using the default Ollama API url and default model (llama3)
node dist/cli/index.js task "Write a python script to calculate fibonacci numbers."

# Change the Ollama API Base URL and specify a different model
node dist/cli/index.js task "Summarize quantum computing" --ollama-url "http://192.168.1.100:11434" --ollama-model "mistral"
```

### Note on Publishing
Please note that this package is not yet published to npm. As per the current roadmap, it will only be published after comprehensive testing ensures everything is fully operational.
