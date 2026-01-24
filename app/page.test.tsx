import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';
import * as webllmEngine from '@/lib/webllm-engine';
import type { MLCEngine } from '@mlc-ai/web-llm';
import { createMockEngine } from '@/lib/test-utils';

vi.mock('@/lib/webllm-engine', () => ({
  getEngineInstance: vi.fn(),
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading screen when engine is initializing', async () => {
    vi.mocked(webllmEngine.getEngineInstance).mockImplementation(
      () => new Promise(() => {})
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Loading AI Model...')).toBeInTheDocument();
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show chat UI when engine is ready', async () => {
    const mockEngine = createMockEngine();
    vi.mocked(webllmEngine.getEngineInstance).mockResolvedValue(mockEngine);

    render(<Home />);

    await waitFor(() => {
      expect(screen.queryByText('Loading AI Model...')).not.toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should show error screen when engine fails to load', async () => {
    const errorMessage = 'WebGPU not supported';
    vi.mocked(webllmEngine.getEngineInstance).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should pass correct props to ModelLoadingScreen during loading', async () => {
    let progressCallback: ((progress: number, message: string) => void) | undefined;

    vi.mocked(webllmEngine.getEngineInstance).mockImplementation(
      async (onProgress) => {
        progressCallback = onProgress;

        if (progressCallback) {
          progressCallback(0.5, 'Loading model: 50%');
        }

        return new Promise(() => {}) as Promise<MLCEngine>;
      }
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Loading model: 50%')).toBeInTheDocument();
    });

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('should show empty message list initially when engine is ready', async () => {
    const mockEngine = createMockEngine();
    vi.mocked(webllmEngine.getEngineInstance).mockResolvedValue(mockEngine);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
    });
  });

  it('should render chat input as disabled during generation', async () => {
    const mockEngine = createMockEngine();
    vi.mocked(webllmEngine.getEngineInstance).mockResolvedValue(mockEngine);

    render(<Home />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your message/i);
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });
  });
});
