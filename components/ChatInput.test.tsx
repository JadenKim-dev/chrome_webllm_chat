import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders with placeholder', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={false} />);

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('submits form with valid input and clears input', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={false} />);

    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
    expect(input.value).toBe('');
  });

  it('does not submit with empty input or whitespace only', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button');

    // Test empty input
    fireEvent.click(button);
    expect(mockOnSend).not.toHaveBeenCalled();

    // Test whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('trims whitespace before submitting', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={false} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '  Test message  ' } });
    fireEvent.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('disables input and button when generating', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={true} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Generating...');

    // Verify it doesn't submit when generating
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} isGenerating={true} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByRole('button');

    expect(input).toHaveAttribute('aria-label', 'Message input');
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
