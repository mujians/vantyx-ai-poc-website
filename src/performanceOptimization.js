import { memo, useMemo, useCallback } from 'react';

/**
 * Performance optimization utilities for window management
 * Implements React.memo and useMemo to optimize rendering of multiple windows
 */

// ============================================================================
// MEMOIZATION UTILITIES
// ============================================================================

/**
 * Custom comparison function for window props
 * Used with React.memo to prevent unnecessary re-renders
 */
export const areWindowPropsEqual = (prevProps, nextProps) => {
  const prevWindow = prevProps.window;
  const nextWindow = nextProps.window;

  // Compare primitive values
  if (
    prevWindow.id !== nextWindow.id ||
    prevWindow.title !== nextWindow.title ||
    prevWindow.component !== nextWindow.component ||
    prevWindow.zIndex !== nextWindow.zIndex ||
    prevWindow.isMinimized !== nextWindow.isMinimized ||
    prevWindow.isMaximized !== nextWindow.isMaximized
  ) {
    return false;
  }

  // Compare position
  if (
    prevWindow.position.x !== nextWindow.position.x ||
    prevWindow.position.y !== nextWindow.position.y
  ) {
    return false;
  }

  // Compare size
  if (
    prevWindow.size.width !== nextWindow.size.width ||
    prevWindow.size.height !== nextWindow.size.height
  ) {
    return false;
  }

  // Compare children (shallow comparison)
  if (prevProps.children !== nextProps.children) {
    return false;
  }

  // All relevant props are equal
  return true;
};

/**
 * Custom comparison for window list items in taskbar
 */
export const areTaskbarItemPropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.isMinimized === nextProps.isMinimized &&
    prevProps.isActive === nextProps.isActive
  );
};

// ============================================================================
// MEMOIZED SELECTORS
// ============================================================================

/**
 * Hook to get memoized window data
 * Prevents re-computation when window array hasn't changed
 */
export const useMemoizedWindows = (windows) => {
  return useMemo(() => {
    return windows.map((window) => ({
      ...window,
      // Pre-compute any derived values here
      isActive: !window.isMinimized,
    }));
  }, [windows]);
};

/**
 * Hook to get memoized visible windows (non-minimized)
 */
export const useVisibleWindows = (windows) => {
  return useMemo(() => {
    return windows.filter((w) => !w.isMinimized);
  }, [windows]);
};

/**
 * Hook to get memoized minimized windows
 */
export const useMinimizedWindows = (windows) => {
  return useMemo(() => {
    return windows.filter((w) => w.isMinimized);
  }, [windows]);
};

/**
 * Hook to get memoized sorted windows by z-index
 */
export const useSortedWindows = (windows) => {
  return useMemo(() => {
    return [...windows].sort((a, b) => a.zIndex - b.zIndex);
  }, [windows]);
};

/**
 * Hook to get memoized window by ID
 */
export const useWindowById = (windows, windowId) => {
  return useMemo(() => {
    return windows.find((w) => w.id === windowId);
  }, [windows, windowId]);
};

/**
 * Hook to get memoized active window (highest z-index)
 */
export const useActiveWindow = (windows) => {
  return useMemo(() => {
    if (windows.length === 0) return null;
    return windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), windows[0]);
  }, [windows]);
};

// ============================================================================
// MEMOIZED CALLBACKS
// ============================================================================

/**
 * Hook to create memoized window action callbacks
 * Prevents re-creation of callback functions on every render
 */
export const useWindowActions = (store) => {
  const focusWindow = useCallback(
    (id) => {
      store.focusWindow(id);
    },
    [store]
  );

  const closeWindow = useCallback(
    (id) => {
      store.closeWindow(id);
    },
    [store]
  );

  const minimizeWindow = useCallback(
    (id) => {
      store.minimizeWindow(id);
    },
    [store]
  );

  const restoreWindow = useCallback(
    (id) => {
      store.restoreWindow(id);
    },
    [store]
  );

  const toggleMaximize = useCallback(
    (id) => {
      store.toggleMaximize(id);
    },
    [store]
  );

  const updateWindowPosition = useCallback(
    (id, position) => {
      store.updateWindowPosition(id, position);
    },
    [store]
  );

  const updateWindowSize = useCallback(
    (id, size) => {
      store.updateWindowSize(id, size);
    },
    [store]
  );

  return {
    focusWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    updateWindowPosition,
    updateWindowSize,
  };
};

// ============================================================================
// MEMOIZED COMPONENTS
// ============================================================================

/**
 * Higher-order component to memoize window components
 * Use this to wrap window components for optimal performance
 */
export const withWindowMemo = (Component) => {
  return memo(Component, areWindowPropsEqual);
};

/**
 * Higher-order component to memoize taskbar item components
 */
export const withTaskbarItemMemo = (Component) => {
  return memo(Component, areTaskbarItemPropsEqual);
};

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

/**
 * Hook to measure component render time (development only)
 */
export const useRenderTime = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }

  return () => {};
};

/**
 * Hook to count component re-renders (development only)
 */
export const useRenderCount = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    let renderCount = 0;

    renderCount++;

    if (renderCount > 10) {
      console.warn(`[Performance] ${componentName} has re-rendered ${renderCount} times`);
    }
  }
};

// ============================================================================
// OPTIMIZED WINDOW STORE SELECTORS
// ============================================================================

/**
 * Selector factory for Zustand store
 * Creates memoized selectors to prevent unnecessary re-renders
 */
export const createWindowSelectors = () => {
  return {
    // Select all windows
    selectWindows: (state) => state.windows,

    // Select visible windows only
    selectVisibleWindows: (state) => state.windows.filter((w) => !w.isMinimized),

    // Select minimized windows only
    selectMinimizedWindows: (state) => state.windows.filter((w) => w.isMinimized),

    // Select window by ID (create a new selector function)
    selectWindowById: (id) => (state) => state.windows.find((w) => w.id === id),

    // Select active window (highest z-index)
    selectActiveWindow: (state) => {
      if (state.windows.length === 0) return null;
      return state.windows.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), state.windows[0]);
    },

    // Select window count
    selectWindowCount: (state) => state.windows.length,

    // Select if max windows reached
    selectIsMaxWindows: (state) => state.windows.length >= state.maxWindows,
  };
};

// ============================================================================
// BATCH UPDATE UTILITIES
// ============================================================================

/**
 * Batch multiple window updates together to minimize re-renders
 */
export const batchWindowUpdates = (updates, store) => {
  // In React 18+, updates are automatically batched
  // This utility is for compatibility and explicit batching
  updates.forEach((update) => update(store));
};

/**
 * Debounce window position/size updates during drag/resize
 */
export const createDebouncedUpdate = (callback, delay = 16) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

/**
 * Throttle window updates during continuous operations
 */
export const createThrottledUpdate = (callback, limit = 16) => {
  let inThrottle;

  return (...args) => {
    if (!inThrottle) {
      callback(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Optimized Window Component
 *
 * import { Window } from './Window';
 * import { withWindowMemo, useWindowActions } from './performanceOptimization';
 *
 * const OptimizedWindow = withWindowMemo(Window);
 *
 * function WindowManager() {
 *   const windows = useWindowStore(state => state.windows);
 *   const store = useWindowStore();
 *   const actions = useWindowActions(store);
 *
 *   return windows.map(window => (
 *     <OptimizedWindow
 *       key={window.id}
 *       window={window}
 *       {...actions}
 *     />
 *   ));
 * }
 */

/**
 * Example: Using Memoized Selectors
 *
 * import { useVisibleWindows, useSortedWindows } from './performanceOptimization';
 *
 * function WindowList() {
 *   const windows = useWindowStore(state => state.windows);
 *   const visibleWindows = useVisibleWindows(windows);
 *   const sortedWindows = useSortedWindows(visibleWindows);
 *
 *   return sortedWindows.map(window => <WindowItem key={window.id} window={window} />);
 * }
 */

/**
 * Example: Throttled Drag Updates
 *
 * import { createThrottledUpdate } from './performanceOptimization';
 *
 * function DraggableWindow() {
 *   const updatePosition = useWindowStore(state => state.updateWindowPosition);
 *   const throttledUpdate = useMemo(
 *     () => createThrottledUpdate(updatePosition, 16),
 *     [updatePosition]
 *   );
 *
 *   return <Rnd onDrag={(e, data) => throttledUpdate(windowId, data)} />;
 * }
 */
