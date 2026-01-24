import { vi } from 'vitest';
import type { MLCEngine } from '@mlc-ai/web-llm';

/**
 * Creates a mock MLCEngine instance for testing purposes.
 * 
 * @returns A mock MLCEngine with a mocked chat.completions.create method
 */
export const createMockEngine = (): MLCEngine => {
  return {
    chat: { completions: { create: vi.fn() } },
  } as unknown as MLCEngine;
};
