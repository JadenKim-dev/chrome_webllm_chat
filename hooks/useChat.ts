import { useState, useCallback } from 'react';
import type { Message } from '@/types/chat';
import { useWebLLM } from './useWebLLM';
import { generateStreamingResponse } from '@/lib/chat-completion';

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    engineState,
    loadProgress,
    loadMessage,
    error: engineError,
    engine,
    retryInitialization,
  } = useWebLLM();

  const addMessage = useCallback(
    (message: Omit<Message, 'id' | 'timestamp'>) => {
      const newMessage: Message = {
        ...message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage.id;
    },
    [],
  );

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg)),
    );
  }, []);

  const handleStreamingError = useCallback(
    (error: unknown, assistantMsgId: string) => {
      setIsGenerating(false);
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      updateMessage(assistantMsgId, `Error: ${errorMessage}`);
    },
    [updateMessage],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (engineState !== 'ready' || !engine) {
        return;
      }

      const userMsgId = addMessage({ role: 'user', content });
      const assistantMsgId = addMessage({ role: 'assistant', content: '' });
      setIsGenerating(true);

      let fullResponse = '';
      const currentMessages: Message[] = [
        ...messages,
        {
          id: userMsgId,
          role: 'user',
          content,
          timestamp: Date.now(),
        },
      ];

      try {
        await generateStreamingResponse(
          engine,
          currentMessages,
          (token) => {
            fullResponse += token;
            updateMessage(assistantMsgId, fullResponse);
          },
          () => setIsGenerating(false),
        );
      } catch (error) {
        handleStreamingError(error, assistantMsgId);
      }
    },
    [
      engineState,
      engine,
      messages,
      addMessage,
      updateMessage,
      handleStreamingError,
    ],
  );

  return {
    messages,
    isGenerating,
    engineState,
    loadProgress,
    loadMessage,
    engineError,
    retryEngine: retryInitialization,
    sendMessage,
  };
}
