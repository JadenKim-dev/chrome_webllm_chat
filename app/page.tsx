'use client';

import { useChatMessages } from '@/hooks/useChat';
import { MessageList } from '@/components/MessageList';
import { ChatInput } from '@/components/ChatInput';
import { ModelLoadingScreen } from '@/components/ModelLoadingScreen';

export default function Home() {
  const {
    messages,
    sendMessage,
    isGenerating,
    engineState,
    loadProgress,
    loadMessage,
    engineError,
    retryEngine,
  } = useChatMessages();

  if (engineState === 'loading' || engineState === 'idle') {
    return (
      <ModelLoadingScreen
        progress={loadProgress}
        message={loadMessage}
        error={null}
        onRetry={undefined}
      />
    );
  }

  if (engineState === 'error') {
    return (
      <ModelLoadingScreen
        progress={0}
        message="Failed to load model"
        error={engineError}
        onRetry={retryEngine}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} className="flex-1" />
      <ChatInput onSend={sendMessage} isGenerating={isGenerating} />
    </div>
  );
}
