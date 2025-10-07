# Vitest Configuration Documentation

## Overview
This document explains the configuration choices made for Vitest in this project.

## Configuration Details

### Test Environment
**Choice:** `jsdom`

**Rationale:**
- The project uses React components that require DOM APIs
- jsdom provides a lightweight browser-like environment for testing React components
- Enables testing of component rendering, events, and DOM manipulation without a real browser

### Coverage Provider
**Choice:** `v8`

**Rationale:**
- Native V8 code coverage is faster than Istanbul
- More accurate coverage reporting
- Built into Node.js, no additional instrumentation needed

### Coverage Reporters
**Choice:** `['text', 'json', 'html']`

**Rationale:**
- **text**: Quick summary in terminal for immediate feedback
- **json**: Machine-readable format for CI/CD integration
- **html**: Detailed visual report for in-depth analysis

### Coverage Exclusions
The following patterns are excluded from coverage:
- `node_modules/`: Third-party dependencies
- `src/**/*.test.{ts,tsx}`: Test files themselves
- `src/**/*.spec.{ts,tsx}`: Spec files
- `**/*.config.{ts,js}`: Configuration files
- `**/dist/**`: Build output
- `**/build/**`: Build artifacts

**Rationale:** These files don't contain application logic that needs testing.

### Coverage Thresholds
**Choice:** 80% for all metrics (branches, functions, lines, statements)

**Rationale:**
- Industry standard for good code coverage
- Balances thorough testing with practical development speed
- Ensures critical code paths are tested without requiring 100% coverage

### Setup Files
**Choice:** `['./src/test/setup.ts']`

**Rationale:**
- Centralizes test setup configuration
- Will contain global test utilities, mocks, and environment setup
- Keeps individual test files clean and focused

### Global Test Settings
**Choice:** `globals: true`

**Rationale:**
- Enables global test APIs (describe, it, expect) without imports
- Provides a more familiar testing experience similar to Jest
- Reduces boilerplate in test files

### Include Patterns
**Choice:** `['src/**/*.{test,spec}.{ts,tsx}']`

**Rationale:**
- Follows common naming conventions for test files
- Supports both `.test` and `.spec` suffixes for flexibility
- Limits test discovery to the `src` directory
- Supports both TypeScript and TSX files

---

## React Testing Library Setup

### Setup File (`src/test/setup.ts`)
**Configuration:**
- Imports `@testing-library/jest-dom` for custom matchers
- Configures automatic cleanup after each test
- Uses Vitest's `afterEach` hook

**Rationale:**
- **jest-dom matchers**: Provides semantic assertions like `toBeInTheDocument()`, `toHaveClass()`, etc.
- **Automatic cleanup**: Ensures DOM is reset between tests, preventing test pollution
- **Centralized setup**: All tests inherit this configuration automatically

### Test Utils (`src/test/utils.tsx`)
**Configuration:**
- Custom `render` function that wraps React Testing Library's render
- Re-exports all React Testing Library utilities
- Extensible for future providers (Context, Router, etc.)

**Rationale:**
- **Custom render**: Allows adding global providers (theme, router, state) without modifying every test
- **Single import point**: Tests can import everything from `@/test/utils` instead of multiple libraries
- **Future-proof**: Easy to extend when adding Context providers or other wrappers
- **Consistency**: Ensures all components are rendered with the same configuration

### Usage Pattern
Tests should import from the custom utils file:
```typescript
import { render, screen } from '@/test/utils';
```

This pattern allows adding global providers later without refactoring all tests.
