'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ModelLoadingScreenProps {
  progress: number;
  message: string;
  error: string | null;
  onRetry?: () => void;
}

export function ModelLoadingScreen({
  progress,
  message,
  error,
  onRetry,
}: ModelLoadingScreenProps) {
  return (
    <div
      className="flex items-center justify-center h-screen bg-white dark:bg-black"
      role="status"
      aria-live="polite"
      aria-busy={!error}
    >
      <div className="flex flex-col items-center gap-6 max-w-md w-full px-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Loading AI Model...
        </h2>

        {error ? (
          <div className="w-full space-y-4">
            <Alert variant="destructive">
              <AlertDescription className="text-center">
                {error}
              </AlertDescription>
            </Alert>
            {onRetry && (
              <Button
                onClick={onRetry}
                className="w-full"
                size="lg"
                aria-label="Retry loading model"
              >
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full space-y-4">
            <div className="w-full space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-zinc-900 dark:text-zinc-100">
                {message}
              </p>
            </div>

            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  First load may take several minutes. Model will be cached for future use.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
