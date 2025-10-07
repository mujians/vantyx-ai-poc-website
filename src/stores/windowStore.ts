import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WindowData {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  previousPosition?: { x: number; y: number };
  previousSize?: { width: number; height: number };
  createdAt: number;
  lastInteraction: number;
}

interface WindowStore {
  windows: WindowData[];
  maxWindows: number;
  maxInactiveTime: number;
  cleanupInterval: number | null;
  openWindow: (window: Omit<WindowData, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized' | 'createdAt' | 'lastInteraction'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  cleanupInactiveWindows: () => void;
  startCleanupTimer: () => void;
  stopCleanupTimer: () => void;
  reset: () => void;
}

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      maxWindows: 5,
      maxInactiveTime: 30 * 60 * 1000, // 30 minutes in milliseconds
      cleanupInterval: null,

      openWindow: (windowData) => {
        const { windows, maxWindows } = get();

        if (windows.length >= maxWindows) {
          console.warn(`Maximum number of windows (${maxWindows}) reached`);
          return;
        }

        const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const maxZIndex = windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
        const now = Date.now();

        const newWindow: WindowData = {
          ...windowData,
          id,
          zIndex: maxZIndex + 1,
          isMinimized: false,
          isMaximized: false,
          createdAt: now,
          lastInteraction: now,
        };

        set({ windows: [...windows, newWindow] });
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
        }));
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, isMinimized: true, lastInteraction: Date.now() } : w
          ),
        }));
      },

      restoreWindow: (id) => {
        const { windows } = get();
        const maxZIndex = windows.reduce((max, w) => Math.max(max, w.zIndex), 0);

        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1, lastInteraction: Date.now() } : w
          ),
        }));
      },

      toggleMaximize: (id) => {
        set((state) => ({
          windows: state.windows.map((w) => {
            if (w.id === id) {
              if (w.isMaximized) {
                return {
                  ...w,
                  isMaximized: false,
                  position: w.previousPosition || w.position,
                  size: w.previousSize || w.size,
                  lastInteraction: Date.now(),
                };
              } else {
                return {
                  ...w,
                  isMaximized: true,
                  previousPosition: w.position,
                  previousSize: w.size,
                  position: { x: 0, y: 0 },
                  size: { width: window.innerWidth, height: window.innerHeight },
                  lastInteraction: Date.now(),
                };
              }
            }
            return w;
          }),
        }));
      },

      focusWindow: (id) => {
        const { windows } = get();
        const maxZIndex = windows.reduce((max, w) => Math.max(max, w.zIndex), 0);
        const targetWindow = windows.find((w) => w.id === id);

        if (targetWindow && targetWindow.zIndex !== maxZIndex) {
          set((state) => ({
            windows: state.windows.map((w) =>
              w.id === id ? { ...w, zIndex: maxZIndex + 1, lastInteraction: Date.now() } : w
            ),
          }));
        }
      },

      updateWindowPosition: (id, position) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, position, lastInteraction: Date.now() } : w
          ),
        }));
      },

      updateWindowSize: (id, size) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, size, lastInteraction: Date.now() } : w
          ),
        }));
      },

      cleanupInactiveWindows: () => {
        const { windows, maxInactiveTime } = get();
        const now = Date.now();

        const activeWindows = windows.filter((w) => {
          const isInactive = now - w.lastInteraction > maxInactiveTime;
          const shouldRemove = isInactive && w.isMinimized;

          if (shouldRemove) {
            console.log(`Cleaning up inactive window: ${w.title} (${w.id})`);
          }

          return !shouldRemove;
        });

        if (activeWindows.length !== windows.length) {
          set({ windows: activeWindows });
        }
      },

      startCleanupTimer: () => {
        const { cleanupInterval, stopCleanupTimer } = get();

        if (cleanupInterval !== null) {
          stopCleanupTimer();
        }

        const interval = window.setInterval(() => {
          get().cleanupInactiveWindows();
        }, 5 * 60 * 1000) as unknown as number; // Check every 5 minutes

        set({ cleanupInterval: interval });
      },

      stopCleanupTimer: () => {
        const { cleanupInterval } = get();

        if (cleanupInterval !== null) {
          window.clearInterval(cleanupInterval);
          set({ cleanupInterval: null });
        }
      },

      reset: () => {
        const { cleanupInterval } = get();

        if (cleanupInterval !== null) {
          window.clearInterval(cleanupInterval);
        }

        set({
          windows: [],
          cleanupInterval: null,
        });
      },
    }),
    {
      name: 'window-manager-storage',
    }
  )
);
