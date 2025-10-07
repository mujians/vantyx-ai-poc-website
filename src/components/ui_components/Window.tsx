import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useWindowStore, WindowData } from '../../stores/windowStore';

const Rnd = lazy(() => import('react-rnd').then((module) => ({ default: module.Rnd })));

interface WindowProps {
  window: WindowData;
  children?: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window: windowData, children }) => {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, updateWindowPosition, updateWindowSize } = useWindowStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Trigger animation on mount
    const timer = setTimeout(() => setIsAnimating(false), 300);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  if (windowData.isMinimized) {
    return null;
  }

  // Mobile full-screen overlay with slide animation
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 bg-white flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ zIndex: windowData.zIndex }}
        onTouchStart={() => focusWindow(windowData.id)}
      >
        <div className="window-header bg-gray-100 border-b border-gray-300 px-4 py-3 flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-800">{windowData.title}</h3>
          <div className="flex gap-3">
            <button
              onClick={() => minimizeWindow(windowData.id)}
              className="w-6 h-6 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 flex items-center justify-center"
              aria-label="Minimize"
            >
              <span className="text-xs text-yellow-900">−</span>
            </button>
            <button
              onClick={() => toggleMaximize(windowData.id)}
              className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 flex items-center justify-center"
              aria-label="Maximize"
            >
              <span className="text-xs text-green-900">□</span>
            </button>
            <button
              onClick={() => closeWindow(windowData.id)}
              className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 flex items-center justify-center"
              aria-label="Close"
            >
              <span className="text-xs text-red-900">×</span>
            </button>
          </div>
        </div>
        <div className="window-content flex-1 p-4 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  // Desktop draggable window
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Rnd
        position={{ x: windowData.position.x, y: windowData.position.y }}
        size={{ width: windowData.size.width, height: windowData.size.height }}
        onDragStop={(e, data) => {
          updateWindowPosition(windowData.id, { x: data.x, y: data.y });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          updateWindowSize(windowData.id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          updateWindowPosition(windowData.id, position);
        }}
        onMouseDown={() => focusWindow(windowData.id)}
        minWidth={200}
        minHeight={100}
        bounds="parent"
        dragHandleClassName="window-header"
        style={{
          zIndex: windowData.zIndex,
        }}
      >
        <div className="window-container bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col h-full">
          <div className="window-header bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center rounded-t-lg cursor-move">
            <h3 className="text-sm font-semibold text-gray-800">{windowData.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => minimizeWindow(windowData.id)}
                className="w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center"
                aria-label="Minimize"
              >
                <span className="text-[8px] text-yellow-900 leading-none">−</span>
              </button>
              <button
                onClick={() => toggleMaximize(windowData.id)}
                className="w-4 h-4 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center"
                aria-label="Maximize"
              >
                <span className="text-[8px] text-green-900 leading-none">□</span>
              </button>
              <button
                onClick={() => closeWindow(windowData.id)}
                className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center"
                aria-label="Close"
              >
                <span className="text-[8px] text-red-900 leading-none">×</span>
              </button>
            </div>
          </div>
          <div className="window-content flex-1 p-4 overflow-auto">
            {children}
          </div>
        </div>
      </Rnd>
    </Suspense>
  );
};
