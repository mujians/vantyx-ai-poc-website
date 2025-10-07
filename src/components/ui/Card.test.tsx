import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render as a div element', () => {
      const { container } = render(<Card>Test</Card>);
      const card = container.querySelector('div');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
    });

    it('should apply elevated variant styles', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-lg');
      expect(card).toHaveClass('bg-white');
    });

    it('should apply bordered variant styles', () => {
      const { container } = render(<Card variant="bordered">Bordered</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-gray-200');
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('should merge custom className with default styles', () => {
      const { container } = render(<Card className="p-4">Test</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
      expect(card).toHaveClass('rounded-lg'); // default class
      expect(card).toHaveClass('bg-white'); // default class
    });
  });

  describe('Composition with Children', () => {
    it('should render multiple children', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Card>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should render complex nested content', () => {
      render(
        <Card>
          <h2>Title</h2>
          <p>Description text</p>
          <button>Action</button>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description text')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });
});

describe('CardHeader Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should have default padding styles', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('p-6');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('p-6'); // default padding
    });
  });
});

describe('CardBody Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(<CardBody>Body content</CardBody>);
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('should have default padding styles', () => {
      const { container } = render(<CardBody>Body</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass('px-6');
      expect(body).toHaveClass('py-4');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<CardBody className="custom-body">Body</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass('custom-body');
    });
  });
});

describe('CardFooter Component', () => {
  describe('Rendering', () => {
    it('should render children content', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should have default padding styles', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('p-6');
      expect(footer).toHaveClass('pt-4');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('custom-footer');
    });
  });
});

describe('Card Composition', () => {
  it('should compose Card with Header, Body, and Footer', () => {
    render(
      <Card>
        <CardHeader>Card Title</CardHeader>
        <CardBody>Card description and main content</CardBody>
        <CardFooter>Card actions</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description and main content')).toBeInTheDocument();
    expect(screen.getByText('Card actions')).toBeInTheDocument();
  });

  it('should work with partial composition', () => {
    render(
      <Card variant="elevated">
        <CardHeader>Only Header</CardHeader>
        <CardBody>Only Body</CardBody>
      </Card>
    );

    expect(screen.getByText('Only Header')).toBeInTheDocument();
    expect(screen.getByText('Only Body')).toBeInTheDocument();
    expect(screen.queryByText('Footer')).not.toBeInTheDocument();
  });

  it('should allow mixing sub-components with custom elements', () => {
    render(
      <Card>
        <CardHeader>Title</CardHeader>
        <div className="custom-section">Custom Content</div>
        <CardFooter>Actions</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
