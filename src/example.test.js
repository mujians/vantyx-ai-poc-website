import { describe, it, expect } from 'vitest';

describe('Vitest Installation Test', () => {
  it('should verify that Vitest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic assertions', () => {
    const result = 'Hello Vitest';
    expect(result).toContain('Vitest');
    expect(result).toBeTruthy();
  });
});
