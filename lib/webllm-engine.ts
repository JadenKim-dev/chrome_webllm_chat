import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';

export const MODEL_NAME = 'Llama-3-8B-Instruct-q4f32_1-MLC';

let engineInstance: MLCEngine | null = null;
let enginePromise: Promise<MLCEngine> | null = null;

/**
 * Get or initialize the WebLLM engine instance.
 * Uses singleton pattern to reuse engine instance across the application.
 *
 * @param onProgress - Callback function for progress updates (progress: 0-1, message: string)
 * @returns Promise<MLCEngine> - The initialized MLCEngine instance
 */
export async function getEngineInstance(
  onProgress?: (progress: number, message: string) => void
): Promise<MLCEngine> {
  if (engineInstance) {
    onProgress?.(1, 'Model already loaded');
    return engineInstance;
  }

  if (enginePromise) {
    return enginePromise;
  }

  enginePromise = CreateMLCEngine(
    MODEL_NAME,
    {
      initProgressCallback: (progress) => {
        const percent = Math.round(progress.progress * 100);
        onProgress?.(progress.progress, `Loading model: ${percent}%`);
      },
    }
  );

  try {
    engineInstance = await enginePromise;
    onProgress?.(1, 'Model loaded successfully');
    return engineInstance;
  } catch (error) {
    // Reset state on error so initialization can be retried
    engineInstance = null;
    enginePromise = null;
    throw error;
  }
}
