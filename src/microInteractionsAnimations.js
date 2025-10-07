// Micro-interactions animations using Framer Motion

// Button hover animations
export const buttonHoverVariants = {
  rest: {
    scale: 1,
    backgroundColor: "rgba(59, 130, 246, 1)",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(37, 99, 235, 1)",
    boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Icon button hover animations
export const iconButtonVariants = {
  rest: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.9,
    rotate: -5,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Input field focus animations
export const inputFocusVariants = {
  unfocused: {
    borderColor: "rgba(209, 213, 219, 1)",
    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
    scale: 1,
  },
  focused: {
    borderColor: "rgba(59, 130, 246, 1)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Input label float animation
export const labelFloatVariants = {
  initial: {
    y: 0,
    scale: 1,
    color: "rgba(107, 114, 128, 1)",
  },
  float: {
    y: -24,
    scale: 0.85,
    color: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Card hover animations
export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Link hover animations
export const linkHoverVariants = {
  rest: {
    color: "rgba(59, 130, 246, 1)",
    x: 0,
  },
  hover: {
    color: "rgba(37, 99, 235, 1)",
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Underline animation for links
export const underlineVariants = {
  rest: {
    width: "0%",
    opacity: 0,
  },
  hover: {
    width: "100%",
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Toggle switch animations
export const toggleVariants = {
  off: {
    x: 0,
    backgroundColor: "rgba(156, 163, 175, 1)",
  },
  on: {
    x: 20,
    backgroundColor: "rgba(59, 130, 246, 1)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
};

// Toggle knob animations
export const toggleKnobVariants = {
  off: {
    scale: 1,
  },
  on: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
};

// Checkbox animations
export const checkboxVariants = {
  unchecked: {
    scale: 0,
    opacity: 0,
  },
  checked: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      duration: 0.3,
    },
  },
};

// Checkbox container animations
export const checkboxContainerVariants = {
  rest: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderColor: "rgba(209, 213, 219, 1)",
  },
  hover: {
    backgroundColor: "rgba(239, 246, 255, 1)",
    borderColor: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  checked: {
    backgroundColor: "rgba(59, 130, 246, 1)",
    borderColor: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Radio button animations
export const radioVariants = {
  unselected: {
    scale: 0,
    opacity: 0,
  },
  selected: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// Radio container animations
export const radioContainerVariants = {
  rest: {
    borderColor: "rgba(209, 213, 219, 1)",
    scale: 1,
  },
  hover: {
    borderColor: "rgba(59, 130, 246, 1)",
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  selected: {
    borderColor: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Tooltip animations
export const tooltipVariants = {
  hidden: {
    opacity: 0,
    y: 5,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

// Badge pulse animation
export const badgePulseVariants = {
  rest: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Menu item hover animations
export const menuItemVariants = {
  rest: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    x: 0,
  },
  hover: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    x: 4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    x: 2,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Dropdown menu animations
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

// Tab hover animations
export const tabVariants = {
  inactive: {
    color: "rgba(107, 114, 128, 1)",
    borderColor: "rgba(0, 0, 0, 0)",
  },
  hover: {
    color: "rgba(59, 130, 246, 1)",
    borderColor: "rgba(59, 130, 246, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  active: {
    color: "rgba(59, 130, 246, 1)",
    borderColor: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Tab indicator slide animation
export const tabIndicatorVariants = {
  initial: {
    x: 0,
  },
  animate: (index) => ({
    x: index * 100,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

// Avatar hover animations
export const avatarHoverVariants = {
  rest: {
    scale: 1,
    borderColor: "rgba(209, 213, 219, 1)",
  },
  hover: {
    scale: 1.1,
    borderColor: "rgba(59, 130, 246, 1)",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Breadcrumb hover animations
export const breadcrumbVariants = {
  rest: {
    color: "rgba(107, 114, 128, 1)",
  },
  hover: {
    color: "rgba(59, 130, 246, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Slider thumb animations
export const sliderThumbVariants = {
  rest: {
    scale: 1,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  hover: {
    scale: 1.2,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  drag: {
    scale: 1.3,
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

// Chip/Tag hover animations
export const chipVariants = {
  rest: {
    scale: 1,
    backgroundColor: "rgba(229, 231, 235, 1)",
  },
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(209, 213, 219, 1)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Close button animations
export const closeButtonVariants = {
  rest: {
    scale: 1,
    rotate: 0,
    opacity: 0.6,
  },
  hover: {
    scale: 1.15,
    rotate: 90,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.9,
    rotate: 90,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

// Accordion arrow rotation
export const accordionArrowVariants = {
  closed: {
    rotate: 0,
  },
  open: {
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// Divider expand animation
export const dividerExpandVariants = {
  initial: {
    width: "0%",
  },
  animate: {
    width: "100%",
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Focus ring animations
export const focusRingVariants = {
  unfocused: {
    scale: 0,
    opacity: 0,
  },
  focused: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Ripple effect animation
export const rippleVariants = {
  initial: {
    scale: 0,
    opacity: 0.5,
  },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Glow effect on hover
export const glowVariants = {
  rest: {
    boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
  },
  hover: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Scroll indicator animations
export const scrollIndicatorVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  bounce: {
    y: [0, 5, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Notification dot pulse
export const notificationDotVariants = {
  rest: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Skeleton shimmer on hover
export const skeletonShimmerVariants = {
  rest: {
    backgroundPosition: "0% 50%",
  },
  hover: {
    backgroundPosition: "100% 50%",
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
