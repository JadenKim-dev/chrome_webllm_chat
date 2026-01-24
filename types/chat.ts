export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isGenerating: boolean;
  error: string | null;
}

export type EngineState = 'idle' | 'loading' | 'ready' | 'error';

export interface EngineStatus {
  state: EngineState;
  progress: number;
  message: string;
  error: string | null;
}
