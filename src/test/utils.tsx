import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { customRender as render };
