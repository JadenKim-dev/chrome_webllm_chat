'use client';

import { useEffect, useState } from 'react';
import { checkWebGPUSupport, type WebGPUSupportResult } from '@/lib/webgpu-check';

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
        <div
          className="relative bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-900 px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  WebGPU Not Supported
                </h3>
                <div className="mt-1 text-sm text-amber-800 dark:text-amber-200">
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
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="flex-shrink-0 p-1 rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              aria-label="Dismiss warning"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
