// Window animations using Framer Motion

export const windowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const modalContentVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export const minimizeVariants = {
  normal: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.3,
    },
  },
  minimized: {
    opacity: 0,
    scale: 0.3,
    y: typeof window !== "undefined" ? window.innerHeight : 800,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

export const restoreVariants = {
  minimized: {
    opacity: 0,
    scale: 0.3,
    y: typeof window !== "undefined" ? window.innerHeight : 800,
  },
  normal: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.4,
    },
  },
};

export const draggableWindowConfig = {
  drag: true,
  dragMomentum: false,
  dragElastic: 0.1,
  dragConstraints: {
    top: 0,
    left: 0,
    right: typeof window !== "undefined" ? window.innerWidth - 400 : 0,
    bottom: typeof window !== "undefined" ? window.innerHeight - 300 : 0,
  },
};

export const resizeVariants = {
  initial: {
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  resizing: {
    transition: {
      type: "tween",
      duration: 0,
      ease: "linear",
    },
  },
  resized: {
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.2,
    },
  },
};

export const resizeHandleVariants = {
  idle: {
    opacity: 0.5,
    scale: 1,
  },
  hover: {
    opacity: 1,
    scale: 1.1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  active: {
    opacity: 1,
    scale: 1.2,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

export const resizeConfig = {
  whileHover: "hover",
  whileTap: "active",
  initial: "idle",
  variants: resizeHandleVariants,
};
