import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ModelLoadingScreen } from './ModelLoadingScreen';

describe('ModelLoadingScreen', () => {
  it('should display status message', () => {
    const message = 'Loading model: 50%';
    render(
      <ModelLoadingScreen
        progress={50}
        message={message}
        error={null}
        onRetry={undefined}
      />
    );

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should show caching notice during loading', () => {
    render(
      <ModelLoadingScreen
        progress={30}
        message="Loading..."
        error={null}
        onRetry={undefined}
      />
    );

    expect(
      screen.getByText(/First load may take several minutes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Model will be cached for future use/i)
    ).toBeInTheDocument();
  });

  it('should display error message when error provided', () => {
    const errorMessage = 'Failed to initialize WebLLM';
    render(
      <ModelLoadingScreen
        progress={0}
        message="Failed"
        error={errorMessage}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should show retry button only on error', () => {
    const { rerender } = render(
      <ModelLoadingScreen
        progress={50}
        message="Loading..."
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();

    rerender(
      <ModelLoadingScreen
        progress={0}
        message="Failed"
        error="Network error"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ModelLoadingScreen
        progress={0}
        message="Failed"
        error="Network error"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have correct accessibility attributes', () => {
    const { rerender } = render(
      <ModelLoadingScreen
        progress={50}
        message="Loading..."
        error={null}
        onRetry={undefined}
      />
    );

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-busy', 'true');

    rerender(
      <ModelLoadingScreen
        progress={0}
        message="Failed"
        error="Error"
        onRetry={vi.fn()}
      />
    );

    expect(container).toHaveAttribute('aria-busy', 'false');
  });

  it('should hide progress bar when error state', () => {
    render(
      <ModelLoadingScreen
        progress={0}
        message="Failed"
        error="Network error"
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should update progress bar width when progress changes', () => {
    const { rerender } = render(
      <ModelLoadingScreen
        progress={25}
        message="Loading model: 25%"
        error={null}
        onRetry={undefined}
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '25%' });

    rerender(
      <ModelLoadingScreen
        progress={75}
        message="Loading model: 75%"
        error={null}
        onRetry={undefined}
      />
    );

    expect(progressBar).toHaveStyle({ width: '75%' });
  });
});
