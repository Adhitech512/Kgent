import { OllamaProvider } from './providers/ollama';
import { SmartContextSystem } from './memory/smart-context';
import { OfflineDatabase } from './memory/offline-db';

export class Orchestrator {
  private providers: any[];
  private smartContext: SmartContextSystem;
  private db: OfflineDatabase;

  constructor(providers: any[] = []) {
    this.providers = providers;
    this.smartContext = new SmartContextSystem();
    this.db = new OfflineDatabase();

    console.log("Kgent Orchestrator Initialized (Beta 0.10)");

    // Single Model Fallback logic
    if (this.providers.length === 1) {
      console.log("Only one model provided. Operating as a standard single AI agent.");
    }
  }
}
