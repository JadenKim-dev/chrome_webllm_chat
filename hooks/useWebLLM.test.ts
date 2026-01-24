import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWebLLM } from './useWebLLM';
import * as webllmEngine from '@/lib/webllm-engine';
import { createMockEngine } from '@/lib/test-utils';

vi.mock('@/lib/webllm-engine', () => ({
  getEngineInstance: vi.fn(),
}));

describe('useWebLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start loading on mount', () => {
    vi.mocked(webllmEngine.getEngineInstance).mockImplementation(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => useWebLLM());

    expect(result.current.engineState).toBe('loading');
    expect(result.current.error).toBeNull();
  });

  it('should initialize engine on mount', async () => {
    const mockEngine = createMockEngine();
    vi.mocked(webllmEngine.getEngineInstance).mockResolvedValue(mockEngine);

    const { result } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result.current.engineState).toBe('ready');
    });

    expect(webllmEngine.getEngineInstance).toHaveBeenCalledTimes(1);
    expect(result.current.engine).toBe(mockEngine);
  });

  it('should update progress during loading', async () => {
    let progressCallback:
      | ((progress: number, message: string) => void)
      | undefined;

    vi.mocked(webllmEngine.getEngineInstance).mockImplementation(
      async (onProgress) => {
        progressCallback = onProgress;

        if (progressCallback) {
          progressCallback(0.25, 'Loading model: 25%');
          progressCallback(0.5, 'Loading model: 50%');
          progressCallback(0.75, 'Loading model: 75%');
          progressCallback(1, 'Model loaded successfully');
        }

        return createMockEngine();
      },
    );

    const { result } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result.current.loadProgress).toBe(100);
    });

    expect(result.current.engineState).toBe('ready');
  });

  it('should set error state on failure', async () => {
    const errorMessage = 'Failed to initialize WebLLM';
    vi.mocked(webllmEngine.getEngineInstance).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result.current.engineState).toBe('error');
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should retry initialization on retry', async () => {
    const mockEngine = createMockEngine();
    vi.mocked(webllmEngine.getEngineInstance)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockEngine);

    const { result } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result.current.engineState).toBe('error');
    });

    result.current.retryInitialization();

    await waitFor(() => {
      expect(result.current.engineState).toBe('ready');
    });

    expect(webllmEngine.getEngineInstance).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('should handle already-loaded engine', async () => {
    const mockEngine = createMockEngine();
    let callCount = 0;

    vi.mocked(webllmEngine.getEngineInstance).mockImplementation(
      async (onProgress) => {
        callCount++;
        if (callCount === 1) {
          onProgress?.(1, 'Model loaded successfully');
        } else {
          onProgress?.(1, 'Model already loaded');
        }
        return mockEngine;
      },
    );

    const { result: result1 } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result1.current.engineState).toBe('ready');
    });

    const { result: result2 } = renderHook(() => useWebLLM());

    await waitFor(() => {
      expect(result2.current.engineState).toBe('ready');
    });

    expect(result2.current.loadMessage).toContain('loaded');
  });
});
