declare global {
  // see https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory

  interface PerformanceMemory {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }

  interface Performance {
    memory: PerformanceMemory;
  }

  interface Window {
    __TAURI__: Tauri;
  }
}

export declare function getMemoryPerformance(): number;
