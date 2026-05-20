export class SmartContextSystem {
  private batchedMessages: Record<string, any[]> = {};

  /**
   * Batches messages going to the same AI model from different places.
   * This uses a structured JSON payload to reduce API usage.
   */
  queueMessage(modelId: string, contextPayload: any) {
    if (!this.batchedMessages[modelId]) {
      this.batchedMessages[modelId] = [];
    }
    this.batchedMessages[modelId].push(contextPayload);
  }

  flush(modelId: string): string {
    const batched = this.batchedMessages[modelId] || [];
    if (batched.length === 0) return '';

    // Group context natively into a compact JSON string to reduce prompt token size
    const payload = JSON.stringify({ context_batch: batched });
    this.batchedMessages[modelId] = [];
    return payload;
  }
}
