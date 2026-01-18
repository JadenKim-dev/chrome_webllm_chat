import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MLCEngine } from '@mlc-ai/web-llm';

vi.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: vi.fn(),
}));

describe('webllm-engine', () => {
  let mockEngine: MLCEngine;
  let mockCreateMLCEngine: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
    mockCreateMLCEngine = CreateMLCEngine as ReturnType<typeof vi.fn>;

    mockEngine = {
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    } as unknown as MLCEngine;

    mockCreateMLCEngine.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('MODEL_NAME', () => {
    it('should export the correct model name', async () => {
      const { MODEL_NAME } = await import('./webllm-engine');
      expect(MODEL_NAME).toBe('Llama-3-8B-Instruct-q4f32_1-MLC');
    });
  });

  describe('getEngineInstance', () => {
    it('should initialize engine on first call', async () => {
      const { getEngineInstance, MODEL_NAME } = await import('./webllm-engine');
      mockCreateMLCEngine.mockResolvedValue(mockEngine);

      const engine = await getEngineInstance();

      expect(engine).toBe(mockEngine);
      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
      expect(mockCreateMLCEngine).toHaveBeenCalledWith(
        MODEL_NAME,
        expect.objectContaining({
          initProgressCallback: expect.any(Function),
        })
      );
    });

    it('should return same instance on subsequent calls', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      mockCreateMLCEngine.mockResolvedValue(mockEngine);

      const engine1 = await getEngineInstance();
      const engine2 = await getEngineInstance();

      expect(engine1).toBe(engine2);
      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent initialization attempts', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      mockCreateMLCEngine.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockEngine), 100);
          })
      );

      const [engine1, engine2, engine3] = await Promise.all([
        getEngineInstance(),
        getEngineInstance(),
        getEngineInstance(),
      ]);

      expect(engine1).toBe(mockEngine);
      expect(engine2).toBe(mockEngine);
      expect(engine3).toBe(mockEngine);
      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
    });

    it('should call progress callback during initialization', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      const onProgress = vi.fn();
      let capturedProgressCallback: ((progress: { progress: number }) => void) | undefined;

      mockCreateMLCEngine.mockImplementation((_modelName, config) => {
        capturedProgressCallback = config.initProgressCallback;
        return Promise.resolve(mockEngine);
      });

      await getEngineInstance(onProgress);

      expect(capturedProgressCallback).toBeDefined();

      capturedProgressCallback?.({ progress: 0.5 });
      expect(onProgress).toHaveBeenCalledWith(0.5, 'Loading model: 50%');

      capturedProgressCallback?.({ progress: 1 });
      expect(onProgress).toHaveBeenCalledWith(1, 'Loading model: 100%');
    });

    it('should call progress callback with "already loaded" when engine exists', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      const onProgress = vi.fn();
      mockCreateMLCEngine.mockResolvedValue(mockEngine);

      await getEngineInstance();

      onProgress.mockClear();
      await getEngineInstance(onProgress);

      expect(onProgress).toHaveBeenCalledWith(1, 'Model already loaded');
      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
    });

    it('should reset state and throw error on initialization failure', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      const error = new Error('Initialization failed');
      mockCreateMLCEngine.mockRejectedValue(error);

      await expect(getEngineInstance()).rejects.toThrow('Initialization failed');

      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(1);
    });

    it('should allow retry after initialization failure', async () => {
      const { getEngineInstance } = await import('./webllm-engine');
      const error = new Error('Initialization failed');
      mockCreateMLCEngine.mockRejectedValueOnce(error).mockResolvedValue(mockEngine);

      await expect(getEngineInstance()).rejects.toThrow('Initialization failed');

      const engine = await getEngineInstance();

      expect(engine).toBe(mockEngine);
      expect(mockCreateMLCEngine).toHaveBeenCalledTimes(2);
    });
  });
});
