export interface IModelProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}
