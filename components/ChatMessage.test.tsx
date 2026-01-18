import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';
import type { Message } from '@/types/chat';

describe('ChatMessage', () => {
  const userMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello, this is a user message',
    timestamp: Date.now(),
  };

  const assistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'Hello, this is an assistant message',
    timestamp: Date.now(),
  };

  it('renders user message with correct styling', () => {
    const { container } = render(<ChatMessage message={userMessage} />);
    expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();

    const wrapper = container.querySelector('[role="article"]');
    expect(wrapper).toHaveClass('justify-end');
  });

  it('renders assistant message with correct styling', () => {
    const { container } = render(<ChatMessage message={assistantMessage} />);
    expect(screen.getByText('Hello, this is an assistant message')).toBeInTheDocument();

    const wrapper = container.querySelector('[role="article"]');
    expect(wrapper).toHaveClass('justify-start');
  });

  it('handles content with special characters', () => {
    const specialMessage: Message = {
      id: '3',
      role: 'user',
      content: 'Special chars: <>&"\'',
      timestamp: Date.now(),
    };

    render(<ChatMessage message={specialMessage} />);
    expect(screen.getByText('Special chars: <>&"\'')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ChatMessage message={userMessage} className="custom-class" />
    );

    const wrapper = container.querySelector('[role="article"]');
    expect(wrapper).toHaveClass('custom-class');
  });
});
