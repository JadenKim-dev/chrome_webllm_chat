'use client';

import { useState, useEffect, useCallback } from 'react';
import { MLCEngine } from '@mlc-ai/web-llm';
import { getEngineInstance } from '@/lib/webllm-engine';
import type { EngineState } from '@/types/chat';

export function useWebLLM() {
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadMessage, setLoadMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<MLCEngine | null>(null);

  const initializeEngine = useCallback(async () => {
    setEngineState('loading');
    setError(null);
    setLoadProgress(0);
    setLoadMessage('Starting model initialization...');

    let engineInstance: MLCEngine;

    try {
      engineInstance = await getEngineInstance((progress, message) => {
        setLoadProgress(Math.round(progress * 100));
        setLoadMessage(message);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load model';
      setError(errorMessage);
      setEngineState('error');
      setLoadMessage('Model loading failed');
      return;
    }

    setEngine(engineInstance);
    setEngineState('ready');
    setLoadProgress(100);
    setLoadMessage('Model loaded successfully');
  }, []);

  const retryInitialization = useCallback(() => {
    initializeEngine();
  }, [initializeEngine]);

  useEffect(() => {
    initializeEngine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    engineState,
    loadProgress,
    loadMessage,
    error,
    engine,
    retryInitialization,
  };
}
