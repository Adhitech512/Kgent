import { IModelProvider } from './index';

export class OllamaProvider implements IModelProvider {
  name = 'Ollama';

  async generate(prompt: string): Promise<string> {
    console.log(`[Ollama] Generating response for: ${prompt}`);
    // Scaffold: Local fallback / single model execution via Ollama
    return 'Simulated Ollama Response';
  }
}
