import express from 'express';
import cors from 'cors';
import path from 'path';
import { Orchestrator, OllamaProvider } from './core';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Singleton orchestrator for the server
let orchestrator: Orchestrator | null = null;
let activeModels: string[] = [];

app.post('/api/init', (req, res) => {
  const { models, url = 'http://127.0.0.1:11434' } = req.body;

  if (!models || !Array.isArray(models) || models.length === 0) {
    return res.status(400).json({ error: 'Must provide an array of models.' });
  }

  activeModels = models;
  const providers = models.map(m => new OllamaProvider(url, m));
  orchestrator = new Orchestrator(providers);

  res.json({ message: 'Orchestrator initialized', models: activeModels });
});

app.post('/api/task', async (req, res) => {
  const { task } = req.body;

  if (!orchestrator) {
    return res.status(400).json({ error: 'Orchestrator not initialized. Call /api/init first.' });
  }

  if (!task) {
    return res.status(400).json({ error: 'Task description is required.' });
  }

  try {
    const result = await orchestrator.executeTask(task);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    initialized: orchestrator !== null,
    models: activeModels,
    mode: activeModels.length > 1 ? 'Multi-Agent Orchestration' : (activeModels.length === 1 ? 'Single-Model Fallback' : 'Offline')
  });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
// Fallback for SPA routing
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

export const startServer = () => {
  app.listen(port, () => {
    console.log(`[Kgent Daemon] Backend server listening on port ${port}`);
    console.log(`[Kgent Web UI] Accessible at http://localhost:${port}`);
  });
};
