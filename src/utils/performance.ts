
// Performance monitoring utilities
export const performanceMonitor = {
  // Measure function execution time
  measureTime: <T>(fn: () => T, label: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Measure async function execution time
  measureAsyncTime: async <T>(fn: () => Promise<T>, label: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`⏱️ ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Log memory usage
  logMemoryUsage: (label: string) => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log(`🧠 ${label} - Memory Usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  },

  // Measure largest contentful paint
  observeLCP: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`🎨 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  // Measure first input delay
  observeFID: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Cast to PerformanceEventTiming to access processingStart
          const eventEntry = entry as PerformanceEventTiming;
          if (eventEntry.processingStart) {
            console.log(`⚡ FID: ${eventEntry.processingStart - entry.startTime}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
};

// Bundle size analyzer
export const bundleAnalyzer = {
  logComponentSize: (componentName: string, component: any) => {
    try {
      const size = JSON.stringify(component).length;
      console.log(`📦 ${componentName} estimated size: ${(size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.warn(`Could not measure size of ${componentName}:`, error);
    }
  }
};

// Network performance utilities
export const networkMonitor = {
  // Check connection quality
  getConnectionInfo: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  },

  // Monitor network requests
  observeNetworkRequests: () => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
            console.log(`🌐 ${entry.name}: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }
};
