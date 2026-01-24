'use client';

import { useEffect, useState } from 'react';
import { checkWebGPUSupport, type WebGPUSupportResult } from '@/lib/webgpu-check';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface WebGPUGuardProps {
  children?: React.ReactNode;
  showBanner?: boolean;
  onCheckComplete?: (result: WebGPUSupportResult) => void;
}

export function WebGPUGuard({
  children,
  showBanner = true,
  onCheckComplete
}: WebGPUGuardProps) {
  const [checkResult, setCheckResult] = useState<WebGPUSupportResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function performCheck() {
      try {
        const result = await checkWebGPUSupport();

        if (isMounted) {
          setCheckResult(result);
          setIsLoading(false);
          onCheckComplete?.(result);
        }
      } catch (error) {
        console.error('WebGPU check failed:', error);
        if (isMounted) {
          setCheckResult({
            supported: false,
            error: 'Failed to perform WebGPU check',
          });
          setIsLoading(false);
        }
      }
    }

    performCheck();

    return () => {
      isMounted = false;
    };
  }, [onCheckComplete]);

  const shouldShowBanner =
    showBanner &&
    !isLoading &&
    !isDismissed &&
    checkResult &&
    !checkResult.supported;

  return (
    <>
      {shouldShowBanner && (
        <div className="border-b px-4 py-3" aria-live="polite">
          <div className="max-w-7xl mx-auto">
            <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <div className="flex items-start justify-between gap-4 flex-1">
                <div className="flex-1">
                  <AlertTitle>WebGPU Not Supported</AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <p>
                      {checkResult?.error || 'Your browser does not support WebGPU, which is required for local AI models.'}
                    </p>
                    {checkResult?.details?.browserInfo && (
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                        Browser: {checkResult.details.browserInfo}
                      </p>
                    )}
                    <p className="mt-2">
                      <span className="font-medium">Recommended browsers:</span> Chrome 113+, Edge 113+
                    </p>
                  </AlertDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDismissed(true)}
                  className="h-6 w-6 shrink-0 text-amber-600 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-100"
                  aria-label="Dismiss warning"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
