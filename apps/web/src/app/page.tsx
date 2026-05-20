import React from 'react';

export default function Home() {
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
              <p className="text-sm text-gray-400">Current Objective</p>
              <div className="bg-gray-900 p-3 rounded mt-1 text-sm border border-gray-700">
                Waiting for task dispatch...
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Connected Providers</p>
              <ul className="mt-2 space-y-2">
                <li className="flex items-center space-x-2 text-sm bg-gray-700 p-2 rounded">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span>Ollama (llama3) @ http://127.0.0.1:11434</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Agent Mesh Network */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Agent Mesh Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="bg-gray-900 p-4 rounded border border-blue-900/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-400">Leader Agent</h3>
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Idle</span>
              </div>
              <p className="text-xs text-gray-500">Decomposes objectives and assigns sub-tasks.</p>
            </div>

            <div className="bg-gray-900 p-4 rounded border border-purple-900/50 opacity-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-purple-400">Worker Agent (Engineer)</h3>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Offline</span>
              </div>
              <p className="text-xs text-gray-500">Awaiting multi-model provider configuration.</p>
            </div>

          </div>
        </section>

        {/* Offline Memory Engine Log */}
        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-300">Offline Memory Engine Logs</h2>
            <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">better-sqlite3 active</span>
          </div>
          <div className="bg-gray-900 p-4 rounded font-mono text-sm text-gray-300 h-48 overflow-y-auto border border-gray-700 space-y-2">
            <p className="text-green-400">[System] Initialized Fully Offline Local Database Wrapper at kgent.db</p>
            <p className="text-blue-400">[System] Kgent Orchestrator Initialized (Beta 0.10)</p>
            <p className="text-gray-500">Listening for memory sync events...</p>
          </div>
        </section>

      </div>
    </main>
  );
}
