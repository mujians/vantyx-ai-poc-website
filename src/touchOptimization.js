// Touch optimization utilities for improved mobile interaction

/**
 * Minimum touch target size recommendations (WCAG 2.1 Level AAA)
 * Ensures touch targets are large enough for comfortable interaction
 */
export const TOUCH_TARGET_SIZES = {
  minimum: 44, // pixels - WCAG minimum
  recommended: 48, // pixels - Material Design recommendation
  comfortable: 56, // pixels - iOS Human Interface Guidelines
};

/**
 * Touch event debounce delay to prevent double-tap issues
 */
export const TOUCH_DEBOUNCE_DELAY = 300; // milliseconds

/**
 * Touch gesture thresholds
 */
export const TOUCH_THRESHOLDS = {
  tapMaxDistance: 10, // max movement in pixels to count as tap
  tapMaxDuration: 300, // max duration in ms to count as tap
  doubleTapMaxDelay: 300, // max delay between taps for double-tap
  longPressMinDuration: 500, // min duration for long press
  swipeMinDistance: 50, // min distance for swipe
  swipeMaxDuration: 1000, // max duration for swipe
  pinchMinDistance: 40, // min distance change for pinch
};

/**
 * Enhanced touch area configuration
 * Adds invisible padding around small touch targets
 */
export const createTouchableArea = (
  targetSize = TOUCH_TARGET_SIZES.minimum,
  minSize = TOUCH_TARGET_SIZES.recommended
) => {
  if (targetSize >= minSize) return {};

  const padding = Math.ceil((minSize - targetSize) / 2);

  return {
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      top: -padding,
      right: -padding,
      bottom: -padding,
      left: -padding,
      zIndex: -1,
    },
  };
};

/**
 * Prevent default touch behaviors that interfere with custom interactions
 */
export const preventDefaultTouchBehaviors = (element) => {
  if (!element) return;

  // Prevent double-tap zoom
  element.style.touchAction = 'manipulation';

  // Prevent text selection during touch interactions
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';

  // Prevent callout on touch and hold
  element.style.webkitTouchCallout = 'none';

  // Prevent tap highlight color
  element.style.webkitTapHighlightColor = 'transparent';
};

/**
 * Enhanced touch event handler with better detection
 */
export class TouchHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      enableTap: true,
      enableDoubleTap: false,
      enableLongPress: false,
      enableSwipe: true,
      enablePinch: false,
      preventDefaultOnTouch: true,
      ...options,
    };

    this.touchStart = null;
    this.touchEnd = null;
    this.lastTap = null;
    this.longPressTimer = null;
    this.touches = [];

    this.init();
  }

  init() {
    if (!this.element) return;

    preventDefaultTouchBehaviors(this.element);

    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: !this.options.preventDefaultOnTouch,
    });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: !this.options.preventDefaultOnTouch,
    });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: !this.options.preventDefaultOnTouch,
    });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  handleTouchStart(event) {
    if (this.options.preventDefaultOnTouch) {
      event.preventDefault();
    }

    this.touchStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now(),
    };

    this.touches = Array.from(event.touches);

    // Long press detection
    if (this.options.enableLongPress) {
      this.longPressTimer = setTimeout(() => {
        this.onLongPress?.(event);
      }, TOUCH_THRESHOLDS.longPressMinDuration);
    }

    this.onTouchStart?.(event);
  }

  handleTouchMove(event) {
    if (this.options.preventDefaultOnTouch && this.touchStart) {
      event.preventDefault();
    }

    // Cancel long press if moved too much
    if (this.longPressTimer && this.touchStart) {
      const deltaX = Math.abs(event.touches[0].clientX - this.touchStart.x);
      const deltaY = Math.abs(event.touches[0].clientY - this.touchStart.y);

      if (deltaX > TOUCH_THRESHOLDS.tapMaxDistance || deltaY > TOUCH_THRESHOLDS.tapMaxDistance) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }

    // Pinch detection
    if (this.options.enablePinch && event.touches.length === 2) {
      this.handlePinch(event);
    }

    this.onTouchMove?.(event);
  }

  handleTouchEnd(event) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    if (!this.touchStart) return;

    this.touchEnd = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
      time: Date.now(),
    };

    const deltaX = this.touchEnd.x - this.touchStart.x;
    const deltaY = this.touchEnd.y - this.touchStart.y;
    const deltaTime = this.touchEnd.time - this.touchStart.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Tap detection
    if (
      this.options.enableTap &&
      distance <= TOUCH_THRESHOLDS.tapMaxDistance &&
      deltaTime <= TOUCH_THRESHOLDS.tapMaxDuration
    ) {
      this.handleTap(event);
    }

    // Swipe detection
    if (
      this.options.enableSwipe &&
      distance >= TOUCH_THRESHOLDS.swipeMinDistance &&
      deltaTime <= TOUCH_THRESHOLDS.swipeMaxDuration
    ) {
      this.handleSwipe(deltaX, deltaY, deltaTime, event);
    }

    this.onTouchEnd?.(event);
    this.touchStart = null;
    this.touchEnd = null;
  }

  handleTouchCancel(event) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    this.touchStart = null;
    this.touchEnd = null;
    this.onTouchCancel?.(event);
  }

  handleTap(event) {
    const now = Date.now();

    // Double tap detection
    if (
      this.options.enableDoubleTap &&
      this.lastTap &&
      now - this.lastTap < TOUCH_THRESHOLDS.doubleTapMaxDelay
    ) {
      this.onDoubleTap?.(event);
      this.lastTap = null;
    } else {
      this.onTap?.(event);
      this.lastTap = now;
    }
  }

  handleSwipe(deltaX, deltaY, deltaTime, event) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    let direction;
    if (absDeltaX > absDeltaY) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    this.onSwipe?.(direction, velocity, event);
  }

  handlePinch(event) {
    if (this.touches.length !== 2 || event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const oldTouch1 = this.touches[0];
    const oldTouch2 = this.touches[1];

    const oldDistance = Math.sqrt(
      Math.pow(oldTouch2.clientX - oldTouch1.clientX, 2) +
        Math.pow(oldTouch2.clientY - oldTouch1.clientY, 2)
    );

    const scale = currentDistance / oldDistance;
    const delta = currentDistance - oldDistance;

    if (Math.abs(delta) >= TOUCH_THRESHOLDS.pinchMinDistance) {
      this.onPinch?.(scale, delta, event);
    }

    this.touches = Array.from(event.touches);
  }

  destroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    // Remove event listeners if needed
  }
}

/**
 * Haptic feedback support (if available)
 */
export const hapticFeedback = {
  light: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
  },
  medium: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(20);
    }
  },
  heavy: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(30);
    }
  },
  success: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([10, 50, 10]);
    }
  },
  error: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([20, 100, 20]);
    }
  },
  selection: () => {
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(5);
    }
  },
};

/**
 * Touch-optimized button styles
 */
export const touchOptimizedButtonStyles = {
  minHeight: `${TOUCH_TARGET_SIZES.recommended}px`,
  minWidth: `${TOUCH_TARGET_SIZES.recommended}px`,
  padding: '12px 16px',
  touchAction: 'manipulation',
  userSelect: 'none',
  webkitUserSelect: 'none',
  webkitTouchCallout: 'none',
  webkitTapHighlightColor: 'transparent',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Detect if device is mobile
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get optimal touch target size based on device
 */
export const getOptimalTouchSize = () => {
  if (isMobileDevice()) {
    return TOUCH_TARGET_SIZES.comfortable;
  }
  return TOUCH_TARGET_SIZES.recommended;
};

/**
 * Smooth scroll with touch optimization
 */
export const smoothScrollTouch = (element, target, duration = 300) => {
  if (!element) return;

  const start = element.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const animateScroll = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    element.scrollTop = start + change * easeInOutCubic(progress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

/**
 * Touch-optimized drag configuration for Framer Motion
 */
export const touchDragConfig = {
  drag: true,
  dragMomentum: true,
  dragElastic: 0.2,
  dragTransition: {
    power: 0.2,
    timeConstant: 200,
    modifyTarget: (target) => Math.round(target),
  },
  // Increase drag constraints for better touch experience
  dragConstraints: { top: 0, left: 0, right: 0, bottom: 0 },
  // More forgiving drag initiation threshold
  dragInitiationDistance: 8,
};

/**
 * Prevent scroll while dragging on touch devices
 */
export const preventScrollOnDrag = (element) => {
  if (!element) return;

  let isDragging = false;

  element.addEventListener('touchstart', () => {
    isDragging = true;
  });

  element.addEventListener('touchend', () => {
    isDragging = false;
  });

  element.addEventListener(
    'touchmove',
    (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
};

/**
 * Touch-optimized window resize handles
 */
export const touchResizeHandleConfig = {
  size: TOUCH_TARGET_SIZES.comfortable, // Larger handles for touch
  hitAreaPadding: 8, // Extra padding for easier grabbing
  styles: {
    width: `${TOUCH_TARGET_SIZES.comfortable}px`,
    height: `${TOUCH_TARGET_SIZES.comfortable}px`,
    position: 'absolute',
    touchAction: 'none',
    userSelect: 'none',
  },
  positions: {
    topLeft: { top: -8, left: -8, cursor: 'nwse-resize' },
    topRight: { top: -8, right: -8, cursor: 'nesw-resize' },
    bottomLeft: { bottom: -8, left: -8, cursor: 'nesw-resize' },
    bottomRight: { bottom: -8, right: -8, cursor: 'nwse-resize' },
    top: { top: -8, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
    bottom: { bottom: -8, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
    left: { left: -8, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
    right: { right: -8, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' },
  },
};

/**
 * Debounce touch events to prevent performance issues
 */
export const debounceTouchEvent = (callback, delay = 16) => {
  let timeoutId;
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();

    clearTimeout(timeoutId);

    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    } else {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback(...args);
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Throttle touch events for better performance
 */
export const throttleTouchEvent = (callback, delay = 16) => {
  let lastCall = 0;
  let timeoutId;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        callback(...args);
      }, delay - (now - lastCall));
    }
  };
};

/**
 * React hook for touch-optimized interactions
 */
export const useTouchOptimized = (ref, options = {}) => {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    enableHaptic = true,
  } = options;

  React.useEffect(() => {
    if (!ref.current) return;

    const handler = new TouchHandler(ref.current, {
      enableTap: !!onTap,
      enableDoubleTap: !!onDoubleTap,
      enableLongPress: !!onLongPress,
      enableSwipe: !!onSwipe,
      enablePinch: !!onPinch,
    });

    handler.onTap = (event) => {
      if (enableHaptic) hapticFeedback.light();
      onTap?.(event);
    };

    handler.onDoubleTap = (event) => {
      if (enableHaptic) hapticFeedback.medium();
      onDoubleTap?.(event);
    };

    handler.onLongPress = (event) => {
      if (enableHaptic) hapticFeedback.heavy();
      onLongPress?.(event);
    };

    handler.onSwipe = (direction, velocity, event) => {
      if (enableHaptic) hapticFeedback.selection();
      onSwipe?.(direction, velocity, event);
    };

    handler.onPinch = (scale, delta, event) => {
      onPinch?.(scale, delta, event);
    };

    return () => handler.destroy();
  }, [ref, onTap, onDoubleTap, onLongPress, onSwipe, onPinch, enableHaptic]);
};

/**
 * Enhanced touch styles for window components
 */
export const touchOptimizedWindowStyles = {
  // Header should be easy to grab on mobile
  header: {
    minHeight: `${TOUCH_TARGET_SIZES.comfortable}px`,
    touchAction: 'none',
    cursor: 'move',
    userSelect: 'none',
    webkitUserSelect: 'none',
    webkitTouchCallout: 'none',
  },
  // Buttons should be large enough for touch
  button: {
    ...touchOptimizedButtonStyles,
    borderRadius: '50%',
    aspectRatio: '1',
  },
  // Content should allow natural scrolling
  content: {
    touchAction: 'pan-y',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
  },
  // Resize handles optimized for touch
  resizeHandle: touchResizeHandleConfig.styles,
};

/**
 * Visual feedback for touch interactions
 */
export const touchFeedbackVariants = {
  initial: { scale: 1 },
  pressed: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
  released: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

/**
 * Accessibility improvements for touch
 */
export const touchAccessibilityProps = {
  role: 'button',
  tabIndex: 0,
  'aria-label': 'Touch interactive element',
  // Support for keyboard fallback
  onKeyDown: (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  },
};

export default {
  TouchHandler,
  hapticFeedback,
  isTouchDevice,
  isMobileDevice,
  getOptimalTouchSize,
  touchOptimizedButtonStyles,
  touchOptimizedWindowStyles,
  touchDragConfig,
  touchFeedbackVariants,
  preventDefaultTouchBehaviors,
  smoothScrollTouch,
  debounceTouchEvent,
  throttleTouchEvent,
};
