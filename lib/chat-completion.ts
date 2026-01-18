import { MLCEngine } from '@mlc-ai/web-llm';
import { ChatMessage } from '@/types/chat';

/**
 * Generate streaming response using WebLLM engine.
 * Tokens are generated incrementally and yielded via callbacks.
 *
 * @param engine - The initialized MLCEngine instance
 * @param messages - Array of chat messages (conversation history)
 * @param onToken - Callback for each generated token/chunk
 * @param onComplete - Callback when generation is complete
 * @throws Error if streaming fails
 */
export async function generateStreamingResponse(
  engine: MLCEngine,
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onComplete: () => void
): Promise<void> {
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const stream = await engine.chat.completions.create({
    messages: formattedMessages,
    stream: true,
    max_tokens: 512,
    temperature: 0.7,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      onToken(delta);
    }
  }

  onComplete();
}
