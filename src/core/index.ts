import { OllamaProvider } from './providers/ollama';
import { SmartContextSystem } from './memory/smart-context';
import { OfflineDatabase } from './memory/offline-db';

export interface IModelProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}

export interface AgentRole {
  roleName: string;
  model: IModelProvider;
  contextWindow: number;
}

export class Orchestrator {
  private providers: IModelProvider[];
  private smartContext: SmartContextSystem;
  private db: OfflineDatabase;
  private roles: AgentRole[] = [];

  constructor(providers: IModelProvider[] = []) {
    this.providers = providers;
    this.smartContext = new SmartContextSystem();
    this.db = new OfflineDatabase();

    console.log("Kgent Orchestrator Initialized (Beta 0.10.2)");
  }

  // Dynamically assign roles based on available providers
  private dynamicallyAssignRoles() {
    console.log("Dynamically profiling capabilities and assigning roles...");
    this.roles = this.providers.map((p, index) => {
      // Simplified heuristic for beta: first is leader, rest are specialized
      if (index === 0) return { roleName: 'Leader', model: p, contextWindow: 8000 };
      if (index === 1) return { roleName: 'Engineer', model: p, contextWindow: 8000 };
      if (index === 2) return { roleName: 'Reviewer', model: p, contextWindow: 8000 };
      return { roleName: `Specialist-${index}`, model: p, contextWindow: 4000 };
    });
  }

  async executeTask(task: string): Promise<string> {
    if (this.providers.length === 0) {
      throw new Error("No model providers configured for Orchestrator.");
    }

    this.db.saveContext('global', 'current_objective', { task });

    if (this.providers.length === 1) {
      console.log("[Fallback Mode] Only one model provided. Operating as a standard single AI agent.");
      const agent = this.providers[0];

      this.smartContext.queueMessage(agent.name, { role: 'system', content: 'You are a helpful AI assistant.' });
      this.smartContext.queueMessage(agent.name, { role: 'user', content: task });

      const batchedContext = this.smartContext.flush(agent.name);
      const response = await agent.generate(batchedContext);

      this.db.saveContext('personal', agent.name, { task, result: response });
      return response;

    } else {
      console.log("[Orchestration Mode] Multiple models detected. Initializing multi-agent routing...");
      this.dynamicallyAssignRoles();

      const leader = this.roles.find(r => r.roleName === 'Leader')!;
      const workers = this.roles.filter(r => r.roleName !== 'Leader');

      console.log(`[${leader.roleName} Agent: ${leader.model.name}] Decomposing objective...`);
      this.smartContext.queueMessage(leader.model.name, { objective: task, instruction: 'Break down task into sub-tasks for workers' });
      const leaderPayload = this.smartContext.flush(leader.model.name);
      const plan = await leader.model.generate(leaderPayload);

      this.db.saveContext('group', 'active_plan', { plan });

      let finalResult = plan;

      // Dynamically iterate over assigned workers
      for (const worker of workers) {
        console.log(`[${worker.roleName} Agent: ${worker.model.name}] Executing assigned sub-task...`);
        this.smartContext.queueMessage(worker.model.name, {
          context: 'Execute your specialized portion of the plan',
          plan: plan
        });

        const workerPayload = this.smartContext.flush(worker.model.name);
        const workerResponse = await worker.model.generate(workerPayload);

        this.db.saveContext('link', `${leader.model.name}-${worker.model.name}`, { execution: workerResponse });
        finalResult += `\n\n[Worker ${worker.roleName} Output]:\n${workerResponse}`;
      }

      return `Multi-agent execution completed.\n\n${finalResult}`;
    }
  }
}

export { OllamaProvider, SmartContextSystem, OfflineDatabase };
