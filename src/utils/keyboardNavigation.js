/**
 * Keyboard Navigation Utilities
 * Provides comprehensive keyboard navigation for the window manager
 */

// Key codes for keyboard shortcuts
export const KEYS = {
  TAB: 'Tab',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  F6: 'F6',
  W: 'w',
  M: 'm',
  C: 'c',
  R: 'r',
  N: 'n',
  BRACKET_LEFT: '[',
  BRACKET_RIGHT: ']',
  DIGIT_1: '1',
  DIGIT_2: '2',
  DIGIT_3: '3',
  DIGIT_4: '4',
  DIGIT_5: '5',
  DIGIT_6: '6',
  DIGIT_7: '7',
  DIGIT_8: '8',
  DIGIT_9: '9',
};

/**
 * Keyboard shortcuts configuration
 */
export const SHORTCUTS = {
  // Window management
  CLOSE_WINDOW: { key: KEYS.W, ctrl: true },
  MINIMIZE_WINDOW: { key: KEYS.M, ctrl: true },
  MAXIMIZE_WINDOW: { key: KEYS.M, ctrl: true, shift: true },
  RESTORE_WINDOW: { key: KEYS.R, ctrl: true },

  // Navigation
  NEXT_WINDOW: { key: KEYS.TAB, ctrl: true },
  PREV_WINDOW: { key: KEYS.TAB, ctrl: true, shift: true },
  CYCLE_WINDOWS: { key: KEYS.F6 },

  // Window positioning
  MOVE_WINDOW_UP: { key: KEYS.ARROW_UP, ctrl: true, alt: true },
  MOVE_WINDOW_DOWN: { key: KEYS.ARROW_DOWN, ctrl: true, alt: true },
  MOVE_WINDOW_LEFT: { key: KEYS.ARROW_LEFT, ctrl: true, alt: true },
  MOVE_WINDOW_RIGHT: { key: KEYS.ARROW_RIGHT, ctrl: true, alt: true },

  // Window resizing
  RESIZE_UP: { key: KEYS.ARROW_UP, ctrl: true, shift: true },
  RESIZE_DOWN: { key: KEYS.ARROW_DOWN, ctrl: true, shift: true },
  RESIZE_LEFT: { key: KEYS.ARROW_LEFT, ctrl: true, shift: true },
  RESIZE_RIGHT: { key: KEYS.ARROW_RIGHT, ctrl: true, shift: true },

  // Quick window selection (Ctrl + 1-9)
  SELECT_WINDOW_1: { key: KEYS.DIGIT_1, ctrl: true },
  SELECT_WINDOW_2: { key: KEYS.DIGIT_2, ctrl: true },
  SELECT_WINDOW_3: { key: KEYS.DIGIT_3, ctrl: true },
  SELECT_WINDOW_4: { key: KEYS.DIGIT_4, ctrl: true },
  SELECT_WINDOW_5: { key: KEYS.DIGIT_5, ctrl: true },
  SELECT_WINDOW_6: { key: KEYS.DIGIT_6, ctrl: true },
  SELECT_WINDOW_7: { key: KEYS.DIGIT_7, ctrl: true },
  SELECT_WINDOW_8: { key: KEYS.DIGIT_8, ctrl: true },
  SELECT_WINDOW_9: { key: KEYS.DIGIT_9, ctrl: true },

  // Taskbar navigation
  NEXT_TASKBAR_ITEM: { key: KEYS.BRACKET_RIGHT, ctrl: true },
  PREV_TASKBAR_ITEM: { key: KEYS.BRACKET_LEFT, ctrl: true },
};

/**
 * Check if a keyboard event matches a shortcut configuration
 */
export const matchesShortcut = (event, shortcut) => {
  const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const keyMatch = event.key === shortcut.key;

  return ctrlMatch && shiftMatch && altMatch && keyMatch;
};

/**
 * Keyboard navigation handler hook
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    windows = [],
    activeWindowId = null,
    onWindowFocus = () => {},
    onWindowClose = () => {},
    onWindowMinimize = () => {},
    onWindowMaximize = () => {},
    onWindowMove = () => {},
    onWindowResize = () => {},
  } = options;

  const handleKeyDown = (event) => {
    // Close window
    if (matchesShortcut(event, SHORTCUTS.CLOSE_WINDOW)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowClose(activeWindowId);
      }
      return;
    }

    // Minimize window
    if (matchesShortcut(event, SHORTCUTS.MINIMIZE_WINDOW)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMinimize(activeWindowId);
      }
      return;
    }

    // Maximize window
    if (matchesShortcut(event, SHORTCUTS.MAXIMIZE_WINDOW)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMaximize(activeWindowId);
      }
      return;
    }

    // Next window
    if (matchesShortcut(event, SHORTCUTS.NEXT_WINDOW) || matchesShortcut(event, SHORTCUTS.CYCLE_WINDOWS)) {
      event.preventDefault();
      const currentIndex = windows.findIndex(w => w.id === activeWindowId);
      const nextIndex = (currentIndex + 1) % windows.length;
      if (windows[nextIndex]) {
        onWindowFocus(windows[nextIndex].id);
      }
      return;
    }

    // Previous window
    if (matchesShortcut(event, SHORTCUTS.PREV_WINDOW)) {
      event.preventDefault();
      const currentIndex = windows.findIndex(w => w.id === activeWindowId);
      const prevIndex = (currentIndex - 1 + windows.length) % windows.length;
      if (windows[prevIndex]) {
        onWindowFocus(windows[prevIndex].id);
      }
      return;
    }

    // Window positioning (move by 20px)
    const MOVE_STEP = 20;
    if (matchesShortcut(event, SHORTCUTS.MOVE_WINDOW_UP)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMove(activeWindowId, { x: 0, y: -MOVE_STEP });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.MOVE_WINDOW_DOWN)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMove(activeWindowId, { x: 0, y: MOVE_STEP });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.MOVE_WINDOW_LEFT)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMove(activeWindowId, { x: -MOVE_STEP, y: 0 });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.MOVE_WINDOW_RIGHT)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowMove(activeWindowId, { x: MOVE_STEP, y: 0 });
      }
      return;
    }

    // Window resizing (resize by 20px)
    const RESIZE_STEP = 20;
    if (matchesShortcut(event, SHORTCUTS.RESIZE_UP)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowResize(activeWindowId, { width: 0, height: -RESIZE_STEP });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.RESIZE_DOWN)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowResize(activeWindowId, { width: 0, height: RESIZE_STEP });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.RESIZE_LEFT)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowResize(activeWindowId, { width: -RESIZE_STEP, height: 0 });
      }
      return;
    }
    if (matchesShortcut(event, SHORTCUTS.RESIZE_RIGHT)) {
      event.preventDefault();
      if (activeWindowId) {
        onWindowResize(activeWindowId, { width: RESIZE_STEP, height: 0 });
      }
      return;
    }

    // Quick window selection (Ctrl + 1-9)
    for (let i = 1; i <= 9; i++) {
      const shortcut = SHORTCUTS[`SELECT_WINDOW_${i}`];
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        if (windows[i - 1]) {
          onWindowFocus(windows[i - 1].id);
        }
        return;
      }
    }
  };

  return { handleKeyDown };
};

/**
 * Focus trap utility for modal dialogs
 */
export const useFocusTrap = (containerRef, isActive = true) => {
  const handleKeyDown = (event) => {
    if (!isActive || !containerRef.current) return;

    if (event.key === KEYS.TAB) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    if (event.key === KEYS.ESCAPE) {
      event.preventDefault();
      // Return focus to the element that triggered the modal
      const trigger = containerRef.current.dataset.trigger;
      if (trigger) {
        document.getElementById(trigger)?.focus();
      }
    }
  };

  return { handleKeyDown };
};

/**
 * Roving tabindex manager for keyboard navigation in lists
 */
export class RovingTabindexManager {
  constructor(items, orientation = 'vertical') {
    this.items = items;
    this.orientation = orientation;
    this.currentIndex = 0;
  }

  setCurrentIndex(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.updateTabindices();
    }
  }

  updateTabindices() {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
      if (index === this.currentIndex) {
        item.focus();
      }
    });
  }

  handleKeyDown(event) {
    const moveNext = this.orientation === 'vertical' ? KEYS.ARROW_DOWN : KEYS.ARROW_RIGHT;
    const movePrev = this.orientation === 'vertical' ? KEYS.ARROW_UP : KEYS.ARROW_LEFT;

    if (event.key === moveNext) {
      event.preventDefault();
      this.setCurrentIndex((this.currentIndex + 1) % this.items.length);
    } else if (event.key === movePrev) {
      event.preventDefault();
      this.setCurrentIndex((this.currentIndex - 1 + this.items.length) % this.items.length);
    } else if (event.key === KEYS.HOME) {
      event.preventDefault();
      this.setCurrentIndex(0);
    } else if (event.key === KEYS.END) {
      event.preventDefault();
      this.setCurrentIndex(this.items.length - 1);
    }
  }
}

/**
 * Get human-readable shortcut label
 */
export const getShortcutLabel = (shortcut) => {
  const parts = [];
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format key name
  let keyLabel = shortcut.key;
  if (keyLabel.startsWith('Arrow')) {
    keyLabel = keyLabel.replace('Arrow', '');
  }
  if (keyLabel.startsWith('Digit')) {
    keyLabel = keyLabel.replace('Digit', '');
  }
  parts.push(keyLabel);

  return parts.join('+');
};

/**
 * Keyboard shortcuts help text
 */
export const SHORTCUTS_HELP = [
  {
    category: 'Window Management',
    shortcuts: [
      { action: 'Close window', label: getShortcutLabel(SHORTCUTS.CLOSE_WINDOW) },
      { action: 'Minimize window', label: getShortcutLabel(SHORTCUTS.MINIMIZE_WINDOW) },
      { action: 'Maximize window', label: getShortcutLabel(SHORTCUTS.MAXIMIZE_WINDOW) },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { action: 'Next window', label: getShortcutLabel(SHORTCUTS.NEXT_WINDOW) },
      { action: 'Previous window', label: getShortcutLabel(SHORTCUTS.PREV_WINDOW) },
      { action: 'Cycle windows', label: getShortcutLabel(SHORTCUTS.CYCLE_WINDOWS) },
      { action: 'Select window 1-9', label: 'Ctrl+1-9' },
    ],
  },
  {
    category: 'Window Positioning',
    shortcuts: [
      { action: 'Move up', label: getShortcutLabel(SHORTCUTS.MOVE_WINDOW_UP) },
      { action: 'Move down', label: getShortcutLabel(SHORTCUTS.MOVE_WINDOW_DOWN) },
      { action: 'Move left', label: getShortcutLabel(SHORTCUTS.MOVE_WINDOW_LEFT) },
      { action: 'Move right', label: getShortcutLabel(SHORTCUTS.MOVE_WINDOW_RIGHT) },
    ],
  },
  {
    category: 'Window Resizing',
    shortcuts: [
      { action: 'Resize up', label: getShortcutLabel(SHORTCUTS.RESIZE_UP) },
      { action: 'Resize down', label: getShortcutLabel(SHORTCUTS.RESIZE_DOWN) },
      { action: 'Resize left', label: getShortcutLabel(SHORTCUTS.RESIZE_LEFT) },
      { action: 'Resize right', label: getShortcutLabel(SHORTCUTS.RESIZE_RIGHT) },
    ],
  },
];

/**
 * Focus Management System
 * Manages focus state and transitions for windows and UI elements
 */
export class FocusManager {
  constructor() {
    this.focusHistory = [];
    this.maxHistorySize = 10;
    this.focusableElements = new Map();
    this.focusGroups = new Map();
    this.currentFocusGroup = null;
  }

  /**
   * Register a focusable element
   */
  registerElement(id, element, group = 'default') {
    this.focusableElements.set(id, { element, group });

    if (!this.focusGroups.has(group)) {
      this.focusGroups.set(group, new Set());
    }
    this.focusGroups.get(group).add(id);
  }

  /**
   * Unregister a focusable element
   */
  unregisterElement(id) {
    const elementData = this.focusableElements.get(id);
    if (elementData) {
      const { group } = elementData;
      this.focusGroups.get(group)?.delete(id);
      this.focusableElements.delete(id);

      // Remove from focus history
      this.focusHistory = this.focusHistory.filter(historyId => historyId !== id);
    }
  }

  /**
   * Set focus to an element by ID
   */
  setFocus(id, options = {}) {
    const elementData = this.focusableElements.get(id);
    if (!elementData) return false;

    const { element, group } = elementData;
    const { preventScroll = false, updateHistory = true } = options;

    try {
      element.focus({ preventScroll });

      if (updateHistory) {
        this.addToHistory(id);
      }

      this.currentFocusGroup = group;
      return true;
    } catch (error) {
      console.warn(`Failed to focus element ${id}:`, error);
      return false;
    }
  }

  /**
   * Add element to focus history
   */
  addToHistory(id) {
    // Remove previous occurrences of this ID
    this.focusHistory = this.focusHistory.filter(historyId => historyId !== id);

    // Add to the beginning
    this.focusHistory.unshift(id);

    // Limit history size
    if (this.focusHistory.length > this.maxHistorySize) {
      this.focusHistory = this.focusHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get previously focused element
   */
  getPreviousFocus() {
    return this.focusHistory[1] || null;
  }

  /**
   * Restore focus to the previous element
   */
  restorePreviousFocus() {
    const previousId = this.getPreviousFocus();
    if (previousId) {
      return this.setFocus(previousId, { updateHistory: false });
    }
    return false;
  }

  /**
   * Get the currently focused element ID
   */
  getCurrentFocus() {
    return this.focusHistory[0] || null;
  }

  /**
   * Move focus to next element in group
   */
  focusNext(group = this.currentFocusGroup) {
    if (!group) return false;

    const groupElements = Array.from(this.focusGroups.get(group) || []);
    if (groupElements.length === 0) return false;

    const currentId = this.getCurrentFocus();
    const currentIndex = groupElements.indexOf(currentId);
    const nextIndex = (currentIndex + 1) % groupElements.length;

    return this.setFocus(groupElements[nextIndex]);
  }

  /**
   * Move focus to previous element in group
   */
  focusPrevious(group = this.currentFocusGroup) {
    if (!group) return false;

    const groupElements = Array.from(this.focusGroups.get(group) || []);
    if (groupElements.length === 0) return false;

    const currentId = this.getCurrentFocus();
    const currentIndex = groupElements.indexOf(currentId);
    const prevIndex = (currentIndex - 1 + groupElements.length) % groupElements.length;

    return this.setFocus(groupElements[prevIndex]);
  }

  /**
   * Move focus to first element in group
   */
  focusFirst(group = this.currentFocusGroup) {
    if (!group) return false;

    const groupElements = Array.from(this.focusGroups.get(group) || []);
    if (groupElements.length === 0) return false;

    return this.setFocus(groupElements[0]);
  }

  /**
   * Move focus to last element in group
   */
  focusLast(group = this.currentFocusGroup) {
    if (!group) return false;

    const groupElements = Array.from(this.focusGroups.get(group) || []);
    if (groupElements.length === 0) return false;

    return this.setFocus(groupElements[groupElements.length - 1]);
  }

  /**
   * Check if an element is currently focused
   */
  isFocused(id) {
    return this.getCurrentFocus() === id;
  }

  /**
   * Get all elements in a focus group
   */
  getGroupElements(group) {
    return Array.from(this.focusGroups.get(group) || []);
  }

  /**
   * Clear focus history
   */
  clearHistory() {
    this.focusHistory = [];
  }

  /**
   * Destroy the focus manager and clean up
   */
  destroy() {
    this.focusableElements.clear();
    this.focusGroups.clear();
    this.clearHistory();
    this.currentFocusGroup = null;
  }
}

/**
 * React hook for focus management
 */
export const useFocusManagement = (elementId, options = {}) => {
  const {
    group = 'default',
    autoFocus = false,
    focusOnMount = false,
    restoreFocusOnUnmount = false,
  } = options;

  const elementRef = React.useRef(null);
  const focusManagerRef = React.useRef(null);

  React.useEffect(() => {
    if (!focusManagerRef.current) {
      focusManagerRef.current = new FocusManager();
    }

    const manager = focusManagerRef.current;
    const element = elementRef.current;

    if (element && elementId) {
      manager.registerElement(elementId, element, group);

      if (autoFocus || focusOnMount) {
        manager.setFocus(elementId);
      }
    }

    return () => {
      if (restoreFocusOnUnmount) {
        manager.restorePreviousFocus();
      }
      if (elementId) {
        manager.unregisterElement(elementId);
      }
    };
  }, [elementId, group, autoFocus, focusOnMount, restoreFocusOnUnmount]);

  const setFocus = React.useCallback(() => {
    focusManagerRef.current?.setFocus(elementId);
  }, [elementId]);

  const isFocused = React.useCallback(() => {
    return focusManagerRef.current?.isFocused(elementId) || false;
  }, [elementId]);

  return {
    elementRef,
    setFocus,
    isFocused,
    focusManager: focusManagerRef.current,
  };
};

/**
 * Focus scope manager for nested focus contexts
 */
export class FocusScopeManager {
  constructor() {
    this.scopes = [];
  }

  /**
   * Push a new focus scope
   */
  pushScope(scopeId, restoreFocus = true) {
    const previousFocus = document.activeElement;
    this.scopes.push({ scopeId, previousFocus, restoreFocus });
  }

  /**
   * Pop the current focus scope
   */
  popScope() {
    const scope = this.scopes.pop();
    if (scope && scope.restoreFocus && scope.previousFocus) {
      scope.previousFocus.focus();
    }
    return scope;
  }

  /**
   * Get the current scope
   */
  getCurrentScope() {
    return this.scopes[this.scopes.length - 1] || null;
  }

  /**
   * Check if currently in a scope
   */
  isInScope() {
    return this.scopes.length > 0;
  }

  /**
   * Clear all scopes
   */
  clearScopes() {
    this.scopes = [];
  }
}

/**
 * Focus visible manager - handles focus visibility based on input method
 */
export class FocusVisibleManager {
  constructor() {
    this.usingKeyboard = false;
    this.lastInteractionWasKeyboard = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Detect keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.usingKeyboard = true;
        this.lastInteractionWasKeyboard = true;
        document.body.classList.add('using-keyboard');
      }
    });

    // Detect mouse usage
    document.addEventListener('mousedown', () => {
      this.usingKeyboard = false;
      this.lastInteractionWasKeyboard = false;
      document.body.classList.remove('using-keyboard');
    });

    // Detect touch usage
    document.addEventListener('touchstart', () => {
      this.usingKeyboard = false;
      this.lastInteractionWasKeyboard = false;
      document.body.classList.remove('using-keyboard');
    });
  }

  /**
   * Check if keyboard is being used for navigation
   */
  isUsingKeyboard() {
    return this.usingKeyboard;
  }

  /**
   * Get appropriate focus style based on input method
   */
  getFocusClassName() {
    return this.lastInteractionWasKeyboard ? 'focus-visible' : 'focus-hidden';
  }
}

export default {
  KEYS,
  SHORTCUTS,
  matchesShortcut,
  useKeyboardNavigation,
  useFocusTrap,
  RovingTabindexManager,
  getShortcutLabel,
  SHORTCUTS_HELP,
  FocusManager,
  useFocusManagement,
  FocusScopeManager,
  FocusVisibleManager,
};
