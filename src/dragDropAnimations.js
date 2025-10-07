// Drag and drop animations using Framer Motion

export const dragAnimationVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    cursor: "grab",
  },
  dragging: {
    scale: 1.05,
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
    cursor: "grabbing",
    zIndex: 9999,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  dropped: {
    scale: 1,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    cursor: "grab",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

export const dragHandleConfig = {
  drag: true,
  dragMomentum: false,
  dragElastic: 0.1,
  dragTransition: {
    power: 0.3,
    timeConstant: 200,
  },
  whileDrag: "dragging",
};

export const dropZoneVariants = {
  idle: {
    scale: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    borderColor: "rgba(59, 130, 246, 0.5)",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    transition: {
      duration: 0.2,
    },
  },
  active: {
    scale: 1.03,
    borderColor: "rgba(59, 130, 246, 0.8)",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.15,
    },
  },
};

export const windowDragConstraints = (windowSize = { width: 400, height: 300 }) => {
  if (typeof window === "undefined") {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }

  return {
    top: 0,
    left: 0,
    right: window.innerWidth - windowSize.width,
    bottom: window.innerHeight - windowSize.height,
  };
};

export const snapToGridAnimation = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
};

export const dragGhostVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 0.7,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

export const onDragStart = () => ({
  scale: 1.05,
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
  cursor: "grabbing",
});

export const onDragEnd = () => ({
  scale: 1,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  cursor: "grab",
});

export const dragHandleHoverVariants = {
  rest: {
    scale: 1,
    opacity: 0.8,
  },
  hover: {
    scale: 1.1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};
