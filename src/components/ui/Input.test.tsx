import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createRef } from 'react';
import Input from './Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render an input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });
  });

  describe('Label', () => {
    it('should render label when provided', () => {
      render(<Input label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<Input />);
      const label = container.querySelector('label');
      expect(label).not.toBeInTheDocument();
    });

    it('should associate label with input', () => {
      render(<Input label="Email" id="email-input" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should apply error styles when error prop is provided', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('focus:ring-red-500');
    });

    it('should apply normal styles when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
      expect(input).not.toHaveClass('border-red-500');
    });

    it('should display error message in red', () => {
      render(<Input error="Error" />);
      const errorText = screen.getByText('Error');
      expect(errorText).toHaveClass('text-red-600');
    });
  });

  describe('Input Types', () => {
    it('should support text type', () => {
      render(<Input type="text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should support email type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should support number type', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange event', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value when user types', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Test value');

      expect(input.value).toBe('Test value');
    });

    it('should handle controlled input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { rerender } = render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'a');

      expect(handleChange).toHaveBeenCalled();

      // Simulate parent component updating value
      rerender(<Input value="a" onChange={handleChange} />);
      expect(input.value).toBe('a');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('should allow focus through ref', () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should merge custom className with default classes', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('w-full'); // default class
    });

    it('should pass through native input props', () => {
      render(
        <Input
          maxLength={10}
          required
          name="username"
          autoComplete="off"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('name', 'username');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-blue-500');
    });

    it('should support aria attributes', () => {
      render(<Input aria-label="Search input" aria-required="true" />);
      const input = screen.getByRole('textbox', { name: 'Search input' });
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should have proper contrast in error state', () => {
      render(<Input error="Error message" />);
      const errorText = screen.getByText('Error message');
      expect(errorText).toHaveClass('text-red-600');
    });
  });
});
