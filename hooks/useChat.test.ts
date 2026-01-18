import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatMessages } from './useChat';

describe('useChatMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useChatMessages());

      expect(result.current.messages).toEqual([]);
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('addMessage', () => {
    it('should add a message to the messages array', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Hello, world!'
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello, world!'
      });
    });

    it('should generate unique id for each message', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'First message'
        });
        result.current.addMessage({
          role: 'user',
          content: 'Second message'
        });
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].id).not.toBe(result.current.messages[1].id);
      expect(result.current.messages[0].id).toBeTruthy();
      expect(result.current.messages[1].id).toBeTruthy();
    });

    it('should add timestamp to each message', () => {
      const { result } = renderHook(() => useChatMessages());
      const beforeTimestamp = Date.now();

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Test message'
        });
      });

      const afterTimestamp = Date.now();

      expect(result.current.messages[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(result.current.messages[0].timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should return the id of the newly added message', () => {
      const { result } = renderHook(() => useChatMessages());
      let messageId: string = '';

      act(() => {
        messageId = result.current.addMessage({
          role: 'user',
          content: 'Test message'
        });
      });

      expect(messageId).toBeTruthy();
      expect(result.current.messages[0].id).toBe(messageId);
    });

    it('should add multiple messages in order', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'First'
        });
        result.current.addMessage({
          role: 'assistant',
          content: 'Second'
        });
        result.current.addMessage({
          role: 'user',
          content: 'Third'
        });
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].content).toBe('First');
      expect(result.current.messages[1].content).toBe('Second');
      expect(result.current.messages[2].content).toBe('Third');
    });
  });

  describe('updateMessage', () => {
    it('should update the content of an existing message', () => {
      const { result } = renderHook(() => useChatMessages());
      let messageId: string = '';

      act(() => {
        messageId = result.current.addMessage({
          role: 'assistant',
          content: 'Initial content'
        });
      });

      act(() => {
        result.current.updateMessage(messageId, 'Updated content');
      });

      expect(result.current.messages[0].content).toBe('Updated content');
      expect(result.current.messages[0].id).toBe(messageId);
    });

    it('should only update the specified message', () => {
      const { result } = renderHook(() => useChatMessages());
      let firstId: string = '';
      let secondId: string = '';

      act(() => {
        firstId = result.current.addMessage({
          role: 'user',
          content: 'First message'
        });
        secondId = result.current.addMessage({
          role: 'assistant',
          content: 'Second message'
        });
      });

      act(() => {
        result.current.updateMessage(secondId, 'Updated second message');
      });

      expect(result.current.messages[0].content).toBe('First message');
      expect(result.current.messages[1].content).toBe('Updated second message');
    });

    it('should not modify other properties when updating content', () => {
      const { result } = renderHook(() => useChatMessages());
      let messageId: string = '';

      act(() => {
        messageId = result.current.addMessage({
          role: 'assistant',
          content: 'Original'
        });
      });

      const originalMessage = result.current.messages[0];

      act(() => {
        result.current.updateMessage(messageId, 'Updated');
      });

      expect(result.current.messages[0].id).toBe(originalMessage.id);
      expect(result.current.messages[0].role).toBe(originalMessage.role);
      expect(result.current.messages[0].timestamp).toBe(originalMessage.timestamp);
    });

    it('should do nothing when updating non-existent message', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Test message'
        });
      });

      const messagesBefore = [...result.current.messages];

      act(() => {
        result.current.updateMessage('non-existent-id', 'New content');
      });

      expect(result.current.messages).toEqual(messagesBefore);
    });

    it('should support streaming message updates', () => {
      const { result } = renderHook(() => useChatMessages());
      let messageId: string = '';

      act(() => {
        messageId = result.current.addMessage({
          role: 'assistant',
          content: ''
        });
      });

      act(() => {
        result.current.updateMessage(messageId, 'Hello');
      });
      expect(result.current.messages[0].content).toBe('Hello');

      act(() => {
        result.current.updateMessage(messageId, 'Hello, ');
      });
      expect(result.current.messages[0].content).toBe('Hello, ');

      act(() => {
        result.current.updateMessage(messageId, 'Hello, world!');
      });
      expect(result.current.messages[0].content).toBe('Hello, world!');
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Message 1'
        });
        result.current.addMessage({
          role: 'assistant',
          content: 'Message 2'
        });
        result.current.addMessage({
          role: 'user',
          content: 'Message 3'
        });
      });

      expect(result.current.messages).toHaveLength(3);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should work when called on empty messages', () => {
      const { result } = renderHook(() => useChatMessages());

      expect(result.current.messages).toEqual([]);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('setIsGenerating', () => {
    it('should update isGenerating state', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.setIsGenerating(true);
      });
      expect(result.current.isGenerating).toBe(true);

      act(() => {
        result.current.setIsGenerating(false);
      });
      expect(result.current.isGenerating).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle a complete chat flow', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'What is React?'
        });
      });

      act(() => {
        result.current.setIsGenerating(true);
      });

      let assistantMessageId: string = '';
      act(() => {
        assistantMessageId = result.current.addMessage({
          role: 'assistant',
          content: ''
        });
      });

      act(() => {
        result.current.updateMessage(assistantMessageId, 'React is');
        result.current.updateMessage(assistantMessageId, 'React is a');
        result.current.updateMessage(assistantMessageId, 'React is a JavaScript library');
      });

      act(() => {
        result.current.setIsGenerating(false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[1].role).toBe('assistant');
      expect(result.current.messages[1].content).toBe('React is a JavaScript library');
      expect(result.current.isGenerating).toBe(false);
    });

    it('should maintain correct state after clearing and adding new messages', () => {
      const { result } = renderHook(() => useChatMessages());

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'First conversation'
        });
        result.current.addMessage({
          role: 'assistant',
          content: 'First response'
        });
      });

      act(() => {
        result.current.clearMessages();
      });

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'New conversation'
        });
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('New conversation');
    });
  });

  describe('Reference stability', () => {
    it('should maintain stable references for callback functions across renders and state updates', () => {
      const { result, rerender } = renderHook(() => useChatMessages());

      const addMessageRef = result.current.addMessage;
      const updateMessageRef = result.current.updateMessage;
      const clearMessagesRef = result.current.clearMessages;

      rerender();

      expect(result.current.addMessage).toBe(addMessageRef);
      expect(result.current.updateMessage).toBe(updateMessageRef);
      expect(result.current.clearMessages).toBe(clearMessagesRef);

      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Test'
        });
      });

      expect(result.current.addMessage).toBe(addMessageRef);
    });
  });
});
