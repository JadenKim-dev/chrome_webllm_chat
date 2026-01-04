import Bowser from 'bowser';

export interface WebGPUSupportResult {
  supported: boolean;
  error?: string;
  details?: {
    hasNavigatorGPU: boolean;
    hasAdapter: boolean;
    browserInfo?: string;
  };
}

export async function checkWebGPUSupport(): Promise<WebGPUSupportResult> {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      error: 'WebGPU check requires browser environment',
    };
  }

  const details = {
    hasNavigatorGPU: false,
    hasAdapter: false,
    browserInfo: getBrowserInfo(),
  };

  if (!('gpu' in navigator)) {
    return {
      supported: false,
      error: 'WebGPU is not supported in this browser. Please use Chrome 113+ or Edge 113+.',
      details,
    };
  }

  details.hasNavigatorGPU = true;
  const gpu = navigator.gpu as GPU;

  let adapter: GPUAdapter | null;
  try {
    adapter = await gpu.requestAdapter();
  } catch (error) {
    console.error(error);
    return {
      supported: false,
      error: error instanceof Error
        ? `WebGPU error: ${error.message}`
        : 'An unexpected error occurred during WebGPU detection',
      details,
    };
  }

  if (!adapter) {
    return {
      supported: false,
      error: 'WebGPU adapter not available. Your GPU may not be supported.',
      details,
    };
  }

  details.hasAdapter = true;

  return {
    supported: true,
    details,
  };
}

function getBrowserInfo(): string {
  if (typeof window === 'undefined') return 'Unknown';

  const browser = Bowser.getParser(window.navigator.userAgent);
  const browserName = browser.getBrowserName();
  const browserVersion = browser.getBrowserVersion();

  const majorVersion = browserVersion?.split('.')[0] ?? 'Unknown';
  return `${browserName} ${majorVersion}`;
}
