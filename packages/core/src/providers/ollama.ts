import { IModelProvider } from '../index';
import { Ollama } from 'ollama';

export class OllamaProvider implements IModelProvider {
  name = 'Ollama';
  private client: Ollama;
  private modelName: string;

  constructor(baseUrl: string = 'http://127.0.0.1:11434', modelName: string = 'llama3') {
    this.client = new Ollama({ host: baseUrl });
    this.modelName = modelName;
    console.log(`[Ollama] Initialized provider connecting to ${baseUrl} using model ${modelName}`);
  }

  async generate(prompt: string): Promise<string> {
    console.log(`[Ollama] Generating response...`);
    try {
      const response = await this.client.generate({
        model: this.modelName,
        prompt: prompt,
      });
      return response.response;
    } catch (error) {
      console.error(`[Ollama] Error generating response:`, error);
      throw error;
    }
  }
}
