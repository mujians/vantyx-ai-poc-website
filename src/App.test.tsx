import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Simple test component
function TestComponent() {
  return (
    <div>
      <h1>React Testing Library Test</h1>
      <p>Installation verified successfully!</p>
    </div>
  );
}

describe('React Testing Library', () => {
  it('should render a component and find text', () => {
    render(<TestComponent />);

    expect(screen.getByText('React Testing Library Test')).toBeInTheDocument();
    expect(screen.getByText('Installation verified successfully!')).toBeInTheDocument();
  });

  it('should query elements by role', () => {
    render(<TestComponent />);

    const heading = screen.getByRole('heading', { name: /react testing library test/i });
    expect(heading).toBeInTheDocument();
  });
});
