/**
 * Screen Reader Support Utilities
 * Provides ARIA live regions and announcements for accessibility
 */

/**
 * Create and manage ARIA live regions for screen reader announcements
 */
class ScreenReaderAnnouncer {
  constructor() {
    this.politeRegion = null;
    this.assertiveRegion = null;
    this.initialized = false;
  }

  /**
   * Initialize live regions in the DOM
   */
  init() {
    if (this.initialized) return;

    // Create polite live region for non-urgent announcements
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.id = 'polite-announcer';

    // Create assertive live region for urgent announcements
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.id = 'assertive-announcer';

    // Add to document
    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);

    this.initialized = true;
  }

  /**
   * Announce a message to screen readers
   * @param {string} message - The message to announce
   * @param {string} priority - 'polite' or 'assertive'
   * @param {number} delay - Delay before announcement (ms)
   */
  announce(message, priority = 'polite', delay = 100) {
    if (!this.initialized) {
      this.init();
    }

    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    // Clear previous message
    region.textContent = '';

    // Announce new message after a small delay to ensure screen readers pick it up
    setTimeout(() => {
      region.textContent = message;

      // Clear message after it's been announced
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }, delay);
  }

  /**
   * Announce polite message (non-urgent)
   * @param {string} message
   */
  announcePolite(message) {
    this.announce(message, 'polite');
  }

  /**
   * Announce assertive message (urgent)
   * @param {string} message
   */
  announceAssertive(message) {
    this.announce(message, 'assertive');
  }

  /**
   * Cleanup live regions
   */
  destroy() {
    if (this.politeRegion && this.politeRegion.parentNode) {
      this.politeRegion.parentNode.removeChild(this.politeRegion);
    }
    if (this.assertiveRegion && this.assertiveRegion.parentNode) {
      this.assertiveRegion.parentNode.removeChild(this.assertiveRegion);
    }
    this.politeRegion = null;
    this.assertiveRegion = null;
    this.initialized = false;
  }
}

// Singleton instance
const announcer = new ScreenReaderAnnouncer();

/**
 * Window-specific screen reader announcements
 */
export const windowAnnouncements = {
  opened: (title) => announcer.announcePolite(`Window opened: ${title}`),
  closed: (title) => announcer.announcePolite(`Window closed: ${title}`),
  minimized: (title) => announcer.announcePolite(`Window minimized: ${title}`),
  maximized: (title) => announcer.announcePolite(`Window maximized: ${title}`),
  restored: (title) => announcer.announcePolite(`Window restored: ${title}`),
  focused: (title) => announcer.announcePolite(`Switched to window: ${title}`),
  moved: (title) => announcer.announcePolite(`Window moved: ${title}`),
  resized: (title) => announcer.announcePolite(`Window resized: ${title}`),
  dragging: (title) => announcer.announcePolite(`Dragging window: ${title}. Use arrow keys to move.`),
  resizing: (title) => announcer.announcePolite(`Resizing window: ${title}. Use arrow keys to resize.`),
};

/**
 * Desktop-specific screen reader announcements
 */
export const desktopAnnouncements = {
  iconSelected: (name) => announcer.announcePolite(`Icon selected: ${name}`),
  iconActivated: (name) => announcer.announcePolite(`Opening ${name}`),
  multipleSelected: (count) => announcer.announcePolite(`${count} icons selected`),
  selectionCleared: () => announcer.announcePolite('Selection cleared'),
};

/**
 * Menu-specific screen reader announcements
 */
export const menuAnnouncements = {
  opened: (menuName) => announcer.announcePolite(`${menuName} menu opened`),
  closed: (menuName) => announcer.announcePolite(`${menuName} menu closed`),
  itemFocused: (itemName) => announcer.announcePolite(`${itemName}`),
  submenuOpened: (submenuName) => announcer.announcePolite(`${submenuName} submenu opened`),
};

/**
 * Form-specific screen reader announcements
 */
export const formAnnouncements = {
  fieldError: (fieldName, error) => announcer.announceAssertive(`${fieldName}: ${error}`),
  fieldValid: (fieldName) => announcer.announcePolite(`${fieldName} is valid`),
  formSubmitting: () => announcer.announcePolite('Submitting form'),
  formSubmitted: () => announcer.announcePolite('Form submitted successfully'),
  formError: (error) => announcer.announceAssertive(`Form error: ${error}`),
};

/**
 * Loading state announcements
 */
export const loadingAnnouncements = {
  started: (label) => announcer.announcePolite(`${label || 'Content'} loading`),
  completed: (label) => announcer.announcePolite(`${label || 'Content'} loaded`),
  failed: (label) => announcer.announceAssertive(`${label || 'Content'} failed to load`),
};

/**
 * Notification announcements
 */
export const notificationAnnouncements = {
  info: (message) => announcer.announcePolite(`Information: ${message}`),
  success: (message) => announcer.announcePolite(`Success: ${message}`),
  warning: (message) => announcer.announceAssertive(`Warning: ${message}`),
  error: (message) => announcer.announceAssertive(`Error: ${message}`),
};

/**
 * Generic announcement function
 */
export const announce = (message, priority = 'polite', delay = 100) => {
  announcer.announce(message, priority, delay);
};

/**
 * Initialize screen reader support
 */
export const initScreenReaderSupport = () => {
  announcer.init();
};

/**
 * Cleanup screen reader support
 */
export const destroyScreenReaderSupport = () => {
  announcer.destroy();
};

/**
 * ARIA attribute helpers
 */
export const ariaHelpers = {
  /**
   * Get ARIA attributes for a window
   */
  getWindowAttributes: (window) => ({
    'role': 'dialog',
    'aria-label': window.title,
    'aria-modal': window.isModal ? 'true' : 'false',
    'aria-hidden': window.isMinimized ? 'true' : 'false',
    'aria-describedby': window.contentId,
  }),

  /**
   * Get ARIA attributes for a window header
   */
  getWindowHeaderAttributes: (windowId) => ({
    'role': 'heading',
    'aria-level': '1',
    'id': `${windowId}-title`,
  }),

  /**
   * Get ARIA attributes for window controls
   */
  getWindowControlAttributes: (action) => {
    const labels = {
      minimize: 'Minimize window',
      maximize: 'Maximize window',
      restore: 'Restore window',
      close: 'Close window',
    };

    return {
      'role': 'button',
      'aria-label': labels[action],
      'tabIndex': 0,
    };
  },

  /**
   * Get ARIA attributes for desktop icons
   */
  getIconAttributes: (icon, isSelected) => ({
    'role': 'button',
    'aria-label': icon.name,
    'aria-pressed': isSelected ? 'true' : 'false',
    'tabIndex': 0,
  }),

  /**
   * Get ARIA attributes for menu items
   */
  getMenuItemAttributes: (item, hasSubmenu = false) => ({
    'role': 'menuitem',
    'aria-label': item.label,
    'aria-haspopup': hasSubmenu ? 'true' : 'false',
    'aria-expanded': hasSubmenu && item.isOpen ? 'true' : 'false',
    'tabIndex': -1,
  }),

  /**
   * Get ARIA attributes for loading states
   */
  getLoadingAttributes: (label) => ({
    'role': 'status',
    'aria-live': 'polite',
    'aria-label': `${label || 'Content'} loading`,
  }),
};

/**
 * Focus management utilities for screen readers
 */
export const focusHelpers = {
  /**
   * Move focus to an element and announce it
   */
  moveFocusWithAnnouncement: (element, announcement) => {
    if (element) {
      element.focus();
      if (announcement) {
        announce(announcement);
      }
    }
  },

  /**
   * Focus the first interactive element in a container
   */
  focusFirstInteractive: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  /**
   * Create a focus trap for modal windows
   */
  createFocusTrap: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
};

export default {
  windowAnnouncements,
  desktopAnnouncements,
  menuAnnouncements,
  formAnnouncements,
  loadingAnnouncements,
  notificationAnnouncements,
  announce,
  initScreenReaderSupport,
  destroyScreenReaderSupport,
  ariaHelpers,
  focusHelpers,
};
