'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  className?: string;
}

export function ChatInput({
  onSend,
  isGenerating,
  className = '',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !isGenerating) {
      onSend(trimmed);
      setInput('');
    }
  };

  const isSendDisabled = !input.trim() || isGenerating;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black ${className}`}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isGenerating}
        placeholder="Type your message..."
        className="flex-1 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Message input"
        aria-disabled={isGenerating}
      />
      <button
        type="submit"
        disabled={isSendDisabled}
        className="px-5 py-3 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900 dark:disabled:hover:bg-zinc-100"
        aria-busy={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Send'}
      </button>
    </form>
  );
}
