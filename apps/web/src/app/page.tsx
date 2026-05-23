"use client";

import React, { useState, useEffect } from 'react';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [status, setStatus] = useState<any>(null);
  const [task, setTask] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      console.error("Daemon offline");
    }
  };

  const handleInit = async (models: string[]) => {
    await fetch('/api/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ models })
    });
    fetchStatus();
  };

  const handleTask = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      const data = await res.json();
      setResult(data.result || data.error);
    } catch {
      setResult("Error executing task. Check daemon logs.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-12 border-b border-gray-700 pb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Kgent Orchestration Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Beta 0.10 Runtime Monitor</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Workspace Config */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">Active Workspace</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Daemon Status</p>
              <div className={`p-2 rounded text-sm mt-1 ${status ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                {status ? "Online" : "Offline (Run 'kgent start')"}
              </div>
            </div>

            {status && !status.initialized && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm mb-2 text-gray-300">Initialize Mesh:</p>
                <div className="space-x-2">
                  <button onClick={() => handleInit(['llama3'])} className="bg-blue-600 px-3 py-1 rounded text-sm">Single Model (Fallback)</button>
                  <button onClick={() => handleInit(['llama3', 'mistral'])} className="bg-purple-600 px-3 py-1 rounded text-sm">Multi-Agent Mesh</button>
                </div>
              </div>
            )}

            {status?.initialized && (
              <>
                <div>
                  <p className="text-sm text-gray-400">Mode</p>
                  <p className="text-sm">{status.mode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Connected Providers</p>
                  <ul className="mt-2 space-y-2">
                    {status.models.map((m: string) => (
                      <li key={m} className="flex items-center space-x-2 text-sm bg-gray-700 p-2 rounded">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <span>Ollama ({m}) @ http://127.0.0.1:11434</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Task Dispatcher */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Task Dispatcher</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="Enter an objective (e.g., 'Write a python web server')"
              className="flex-1 bg-gray-900 border border-gray-700 p-2 rounded text-white"
            />
            <button
              onClick={handleTask}
              disabled={!status?.initialized || loading}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Dispatch'}
            </button>
          </div>

          <div className="bg-gray-900 p-4 rounded border border-gray-700 h-64 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
             {result ? result : <span className="text-gray-500">Output will appear here...</span>}
          </div>
        </section>
      </div>
    </main>
  );
}
