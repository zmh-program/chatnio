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
}

export declare function getMemoryPerformance(): number;
