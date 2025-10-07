// Swipe gestures for closing windows using Framer Motion

/**
 * Configuration for swipe-to-close gesture
 * Allows users to swipe down on mobile to close windows
 */
export const swipeCloseConfig = {
  drag: "y",
  dragConstraints: { top: 0, bottom: 0 },
  dragElastic: { top: 0, bottom: 0.8 },
  dragMomentum: true,
  onDragEnd: (event, info) => {
    // Threshold for triggering close action
    const swipeThreshold = 150; // pixels
    const velocityThreshold = 500; // pixels per second

    // Close if swiped down far enough or with enough velocity
    if (
      info.offset.y > swipeThreshold ||
      info.velocity.y > velocityThreshold
    ) {
      return true; // Should close
    }
    return false; // Should not close
  },
};

/**
 * Variants for swipe-to-close animation
 * Provides smooth feedback during swipe gesture
 */
export const swipeVariants = {
  initial: {
    y: 0,
    opacity: 1,
  },
  dragging: {
    transition: {
      type: "tween",
      duration: 0,
      ease: "linear",
    },
  },
  closing: {
    y: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
  reset: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 35,
      duration: 0.2,
    },
  },
};

/**
 * Hook to handle swipe gestures for window closing
 * @param {Function} onClose - Callback function to execute when window should close
 * @returns {Object} - Swipe gesture handlers and state
 */
export const useSwipeToClose = (onClose) => {
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 150;
    const velocityThreshold = 500;

    if (
      info.offset.y > swipeThreshold ||
      info.velocity.y > velocityThreshold
    ) {
      // Trigger close action
      if (onClose) {
        onClose();
      }
      return true;
    }
    return false;
  };

  return {
    drag: "y",
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: { top: 0, bottom: 0.8 },
    dragMomentum: true,
    onDragEnd: handleDragEnd,
  };
};

/**
 * Configuration for horizontal swipe navigation
 * Allows users to swipe left/right between windows
 */
export const swipeNavigationConfig = {
  drag: "x",
  dragConstraints: { left: 0, right: 0 },
  dragElastic: 0.3,
  dragMomentum: true,
  onDragEnd: (event, info) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    // Swipe left (next)
    if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      return "next";
    }

    // Swipe right (previous)
    if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > velocityThreshold
    ) {
      return "previous";
    }

    return null;
  },
};

/**
 * Variants for horizontal swipe navigation
 */
export const swipeNavigationVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

/**
 * Swipe indicator component variants
 * Visual feedback showing swipe progress
 */
export const swipeIndicatorVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

/**
 * Calculate swipe progress for visual feedback
 * @param {number} offset - Current drag offset
 * @param {number} threshold - Threshold for action
 * @returns {number} - Progress percentage (0-1)
 */
export const calculateSwipeProgress = (offset, threshold = 150) => {
  return Math.min(Math.abs(offset) / threshold, 1);
};

/**
 * Get swipe feedback color based on progress
 * @param {number} progress - Swipe progress (0-1)
 * @returns {string} - Color value
 */
export const getSwipeFeedbackColor = (progress) => {
  if (progress < 0.3) return "rgba(59, 130, 246, 0.1)"; // blue
  if (progress < 0.7) return "rgba(251, 191, 36, 0.2)"; // amber
  return "rgba(239, 68, 68, 0.3)"; // red
};

/**
 * Debounce function for swipe events
 * Prevents multiple rapid triggers
 */
export const debounceSwipe = (callback, delay = 300) => {
  let timeoutId;
  let isDebouncing = false;

  return (...args) => {
    if (isDebouncing) return;

    isDebouncing = true;
    callback(...args);

    timeoutId = setTimeout(() => {
      isDebouncing = false;
    }, delay);

    return () => clearTimeout(timeoutId);
  };
};
