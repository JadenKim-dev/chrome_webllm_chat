'use client';

import { useChatMessages } from '@/hooks/useChat';
import { MessageList } from '@/components/MessageList';
import { ChatInput } from '@/components/ChatInput';

export default function Home() {
  const { messages, addMessage, isGenerating } = useChatMessages();

  const handleSend = (message: string) => {
    addMessage({ role: 'user', content: message });
  };

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} className="flex-1" />
      <ChatInput onSend={handleSend} isGenerating={isGenerating} />
    </div>
  );
}
