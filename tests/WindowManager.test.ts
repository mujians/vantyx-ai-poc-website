import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowStore, WindowData } from '../src/stores/windowStore';

describe('WindowManager - useWindowStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useWindowStore());
    act(() => {
      result.current.windows.forEach((w) => result.current.closeWindow(w.id));
    });
  });

  afterEach(() => {
    // Clean up timers
    const { result } = renderHook(() => useWindowStore());
    act(() => {
      result.current.stopCleanupTimer();
    });
  });

  describe('openWindow', () => {
    it('should create a new window with correct properties', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
      });

      expect(result.current.windows).toHaveLength(1);
      const window = result.current.windows[0];
      expect(window.title).toBe('Test Window');
      expect(window.component).toBe('TestComponent');
      expect(window.position).toEqual({ x: 100, y: 100 });
      expect(window.size).toEqual({ width: 400, height: 300 });
      expect(window.isMinimized).toBe(false);
      expect(window.isMaximized).toBe(false);
      expect(window.zIndex).toBe(1);
      expect(window.id).toBeDefined();
      expect(window.createdAt).toBeDefined();
      expect(window.lastInteraction).toBeDefined();
    });

    it('should generate unique IDs for multiple windows', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
      });

      expect(result.current.windows).toHaveLength(2);
      expect(result.current.windows[0].id).not.toBe(result.current.windows[1].id);
    });

    it('should automatically increment z-index for new windows', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
        result.current.openWindow({
          title: 'Window 3',
          component: 'Component3',
          position: { x: 300, y: 300 },
          size: { width: 400, height: 300 },
        });
      });

      expect(result.current.windows[0].zIndex).toBe(1);
      expect(result.current.windows[1].zIndex).toBe(2);
      expect(result.current.windows[2].zIndex).toBe(3);
    });

    it('should respect maxWindows limit', () => {
      const { result } = renderHook(() => useWindowStore());
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        for (let i = 0; i < 6; i++) {
          result.current.openWindow({
            title: `Window ${i + 1}`,
            component: `Component${i + 1}`,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
          });
        }
      });

      expect(result.current.windows).toHaveLength(5);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Maximum number of windows (5) reached');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('closeWindow', () => {
    it('should remove a window by ID', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      expect(result.current.windows).toHaveLength(1);

      act(() => {
        result.current.closeWindow(windowId);
      });

      expect(result.current.windows).toHaveLength(0);
    });

    it('should not affect other windows when closing one', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId1: string;

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId1 = result.current.windows[0].id;
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
      });

      expect(result.current.windows).toHaveLength(2);

      act(() => {
        result.current.closeWindow(windowId1);
      });

      expect(result.current.windows).toHaveLength(1);
      expect(result.current.windows[0].title).toBe('Window 2');
    });
  });

  describe('minimizeWindow', () => {
    it('should set isMinimized to true', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      expect(result.current.windows[0].isMinimized).toBe(false);

      act(() => {
        result.current.minimizeWindow(windowId);
      });

      expect(result.current.windows[0].isMinimized).toBe(true);
    });

    it('should update lastInteraction timestamp when minimizing', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;
      let originalTimestamp: number;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
        originalTimestamp = result.current.windows[0].lastInteraction;
      });

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        act(() => {
          result.current.minimizeWindow(windowId);
        });

        expect(result.current.windows[0].lastInteraction).toBeGreaterThan(originalTimestamp);
      }, 10);
    });
  });

  describe('restoreWindow', () => {
    it('should set isMinimized to false and bring window to front', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
        result.current.minimizeWindow(windowId);
      });

      expect(result.current.windows[0].isMinimized).toBe(true);
      expect(result.current.windows[0].zIndex).toBe(1);

      act(() => {
        result.current.restoreWindow(windowId);
      });

      expect(result.current.windows[0].isMinimized).toBe(false);
      expect(result.current.windows[0].zIndex).toBe(3); // Should be brought to front
    });
  });

  describe('toggleMaximize', () => {
    it('should maximize window and save previous state', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      act(() => {
        result.current.toggleMaximize(windowId);
      });

      const window = result.current.windows[0];
      expect(window.isMaximized).toBe(true);
      expect(window.previousPosition).toEqual({ x: 100, y: 100 });
      expect(window.previousSize).toEqual({ width: 400, height: 300 });
      expect(window.position).toEqual({ x: 0, y: 0 });
    });

    it('should restore window to previous state when toggling maximize off', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
        result.current.toggleMaximize(windowId);
      });

      expect(result.current.windows[0].isMaximized).toBe(true);

      act(() => {
        result.current.toggleMaximize(windowId);
      });

      const window = result.current.windows[0];
      expect(window.isMaximized).toBe(false);
      expect(window.position).toEqual({ x: 100, y: 100 });
      expect(window.size).toEqual({ width: 400, height: 300 });
    });
  });

  describe('focusWindow', () => {
    it('should bring window to front by increasing z-index', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId1: string;
      let windowId2: string;

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId1 = result.current.windows[0].id;
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
        windowId2 = result.current.windows[1].id;
      });

      expect(result.current.windows[0].zIndex).toBe(1);
      expect(result.current.windows[1].zIndex).toBe(2);

      act(() => {
        result.current.focusWindow(windowId1);
      });

      expect(result.current.windows[0].zIndex).toBe(3);
      expect(result.current.windows[1].zIndex).toBe(2);
    });

    it('should not change z-index if window is already on top', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      const initialZIndex = result.current.windows[0].zIndex;

      act(() => {
        result.current.focusWindow(windowId);
      });

      expect(result.current.windows[0].zIndex).toBe(initialZIndex);
    });
  });

  describe('updateWindowPosition', () => {
    it('should update window position', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      act(() => {
        result.current.updateWindowPosition(windowId, { x: 200, y: 300 });
      });

      expect(result.current.windows[0].position).toEqual({ x: 200, y: 300 });
    });
  });

  describe('updateWindowSize', () => {
    it('should update window size', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      act(() => {
        result.current.updateWindowSize(windowId, { width: 600, height: 500 });
      });

      expect(result.current.windows[0].size).toEqual({ width: 600, height: 500 });
    });
  });

  describe('cleanupInactiveWindows', () => {
    it('should remove minimized windows that have been inactive for too long', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
        result.current.minimizeWindow(windowId);
      });

      // Manually set lastInteraction to an old timestamp
      act(() => {
        const oldTimestamp = Date.now() - (31 * 60 * 1000); // 31 minutes ago
        const window = result.current.windows[0];
        result.current.windows[0] = { ...window, lastInteraction: oldTimestamp };
      });

      expect(result.current.windows).toHaveLength(1);

      act(() => {
        result.current.cleanupInactiveWindows();
      });

      expect(result.current.windows).toHaveLength(0);
    });

    it('should not remove active windows', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
      });

      expect(result.current.windows).toHaveLength(1);

      act(() => {
        result.current.cleanupInactiveWindows();
      });

      expect(result.current.windows).toHaveLength(1);
    });

    it('should not remove inactive windows that are not minimized', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId: string;

      act(() => {
        result.current.openWindow({
          title: 'Test Window',
          component: 'TestComponent',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId = result.current.windows[0].id;
      });

      // Manually set lastInteraction to an old timestamp but don't minimize
      act(() => {
        const oldTimestamp = Date.now() - (31 * 60 * 1000);
        const window = result.current.windows[0];
        result.current.windows[0] = { ...window, lastInteraction: oldTimestamp };
      });

      expect(result.current.windows).toHaveLength(1);

      act(() => {
        result.current.cleanupInactiveWindows();
      });

      expect(result.current.windows).toHaveLength(1);
    });
  });

  describe('Cleanup Timer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should start cleanup timer', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.startCleanupTimer();
      });

      expect(result.current.cleanupInterval).not.toBeNull();
    });

    it('should stop cleanup timer', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.startCleanupTimer();
      });

      expect(result.current.cleanupInterval).not.toBeNull();

      act(() => {
        result.current.stopCleanupTimer();
      });

      expect(result.current.cleanupInterval).toBeNull();
    });

    it('should clear old timer when starting a new one', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        result.current.startCleanupTimer();
      });

      const firstInterval = result.current.cleanupInterval;

      act(() => {
        result.current.startCleanupTimer();
      });

      const secondInterval = result.current.cleanupInterval;

      expect(firstInterval).not.toBe(secondInterval);
      expect(result.current.cleanupInterval).not.toBeNull();
    });
  });

  describe('Z-index Management', () => {
    it('should maintain unique z-indexes for all windows', () => {
      const { result } = renderHook(() => useWindowStore());

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.openWindow({
            title: `Window ${i + 1}`,
            component: `Component${i + 1}`,
            position: { x: 100, y: 100 },
            size: { width: 400, height: 300 },
          });
        }
      });

      const zIndexes = result.current.windows.map((w) => w.zIndex);
      const uniqueZIndexes = new Set(zIndexes);

      expect(uniqueZIndexes.size).toBe(zIndexes.length);
    });

    it('should handle multiple focus operations correctly', () => {
      const { result } = renderHook(() => useWindowStore());
      let windowId1: string;
      let windowId2: string;
      let windowId3: string;

      act(() => {
        result.current.openWindow({
          title: 'Window 1',
          component: 'Component1',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
        });
        windowId1 = result.current.windows[0].id;
        result.current.openWindow({
          title: 'Window 2',
          component: 'Component2',
          position: { x: 200, y: 200 },
          size: { width: 400, height: 300 },
        });
        windowId2 = result.current.windows[1].id;
        result.current.openWindow({
          title: 'Window 3',
          component: 'Component3',
          position: { x: 300, y: 300 },
          size: { width: 400, height: 300 },
        });
        windowId3 = result.current.windows[2].id;
      });

      // Focus windows in different order
      act(() => {
        result.current.focusWindow(windowId1);
      });

      expect(result.current.windows[0].zIndex).toBe(4);

      act(() => {
        result.current.focusWindow(windowId2);
      });

      expect(result.current.windows[1].zIndex).toBe(5);

      act(() => {
        result.current.focusWindow(windowId3);
      });

      expect(result.current.windows[2].zIndex).toBe(6);
    });
  });
});
