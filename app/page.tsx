'use client';

import { useChatMessages } from '@/hooks/useChat';
import { MessageList } from '@/components/MessageList';
import { ChatInput } from '@/components/ChatInput';
import { ModelLoadingScreen } from '@/components/ModelLoadingScreen';
import { WebGPUGuard } from '@/components/WebGPUGuard';
import { Button } from '@/components/ui/button';

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
    clearMessages,
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
    <WebGPUGuard>
      <div className="flex flex-col h-screen">
        <header className="border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Browser LLM Chat</h1>
            <Button onClick={clearMessages} variant="outline" size="sm">
              New Chat
            </Button>
          </div>
        </header>
        <MessageList messages={messages} className="flex-1" />
        <ChatInput onSend={sendMessage} isGenerating={isGenerating} />
      </div>
    </WebGPUGuard>
  );
}
