import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';

describe('MessageList', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('renders empty state when no messages', () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });

  it('renders multiple messages', () => {
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: 'First message',
        timestamp: Date.now(),
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: 'Second message',
        timestamp: Date.now(),
      },
    ];

    render(<MessageList messages={messages} />);
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<MessageList messages={[]} className="custom-class" />);
    const logElement = container.querySelector('[role="log"]');

    expect(logElement).toHaveClass('custom-class');
  });
});
