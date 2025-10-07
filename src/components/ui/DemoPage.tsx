import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { Card, CardHeader, CardBody, CardFooter } from './Card';
import { Logo } from './Logo';
import { Layout, LayoutHeader, LayoutMain, LayoutSidebar } from './Layout';
import { sanitizeText, sanitizeEmail } from '../../utils/sanitize';

const DemoPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputWithError, setInputWithError] = useState('');

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center justify-center py-8">
          <Logo className="text-blue-600" />
        </div>
      </LayoutHeader>

      <LayoutSidebar>
        <Card variant="bordered" className="sticky top-6">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
          </CardHeader>
          <CardBody>
            <nav className="space-y-2">
              <a href="#buttons" className="block text-blue-600 hover:underline">Buttons</a>
              <a href="#inputs" className="block text-blue-600 hover:underline">Inputs</a>
              <a href="#cards" className="block text-blue-600 hover:underline">Cards</a>
              <a href="#logo" className="block text-blue-600 hover:underline">Logo</a>
              <a href="#layout" className="block text-blue-600 hover:underline">Layout</a>
            </nav>
          </CardBody>
        </Card>
      </LayoutSidebar>

      <LayoutMain>
        <div className="space-y-12">
          {/* Buttons Section */}
          <section id="buttons">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Button Component</h2>
                <p className="text-gray-600 mt-2">Various button styles and sizes</p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="small">Small</Button>
                    <Button size="medium">Medium</Button>
                    <Button size="large">Large</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">States</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button>Enabled</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Inputs Section */}
          <section id="inputs">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Input Component</h2>
                <p className="text-gray-600 mt-2">Form input fields with labels and error states</p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Basic Input</h3>
                  <Input
                    label="Username"
                    placeholder="Enter your username"
                    value={inputValue}
                    onChange={(e) => setInputValue(sanitizeText(e.target.value))}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Input with Error</h3>
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={inputWithError}
                    onChange={(e) => setInputWithError(sanitizeEmail(e.target.value))}
                    error="Please enter a valid email address"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Input Types</h3>
                  <div className="space-y-4">
                    <Input label="Password" type="password" placeholder="Enter password" />
                    <Input label="Number" type="number" placeholder="Enter a number" />
                    <Input label="Date" type="date" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Cards Section */}
          <section id="cards">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Card Component</h2>
                <p className="text-gray-600 mt-2">Card variants and subcomponents</p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Card Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card variant="default">
                      <CardBody>
                        <h4 className="font-semibold mb-2">Default Card</h4>
                        <p className="text-gray-600">Standard shadow styling</p>
                      </CardBody>
                    </Card>

                    <Card variant="elevated">
                      <CardBody>
                        <h4 className="font-semibold mb-2">Elevated Card</h4>
                        <p className="text-gray-600">Larger shadow for emphasis</p>
                      </CardBody>
                    </Card>

                    <Card variant="bordered">
                      <CardBody>
                        <h4 className="font-semibold mb-2">Bordered Card</h4>
                        <p className="text-gray-600">Border instead of shadow</p>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Card with All Sections</h3>
                  <Card variant="default">
                    <CardHeader className="border-b border-gray-200">
                      <h4 className="text-xl font-bold">Card Title</h4>
                      <p className="text-gray-600">Card subtitle or description</p>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-700">
                        This is the main content area of the card. It can contain any content
                        you need, including text, images, or other components.
                      </p>
                    </CardBody>
                    <CardFooter className="border-t border-gray-200">
                      <div className="flex gap-2">
                        <Button size="small" variant="primary">Action</Button>
                        <Button size="small" variant="ghost">Cancel</Button>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Logo Section */}
          <section id="logo">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Logo Component</h2>
                <p className="text-gray-600 mt-2">ASCII-style brand logo</p>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Logo Variations</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                      <Logo />
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <Logo className="text-blue-600" />
                    </div>
                    <div className="p-4 bg-gray-900 rounded">
                      <Logo className="text-white" />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* Layout Section */}
          <section id="layout">
            <Card variant="elevated">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">Layout Component</h2>
                <p className="text-gray-600 mt-2">Responsive layout system currently in use on this page</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Responsive grid layout (12 columns on large screens)</li>
                      <li>Mobile-first design approach</li>
                      <li>Layout components: Header, Sidebar, Main, Footer</li>
                      <li>Responsive padding and spacing</li>
                      <li>Container with max-width constraints</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 font-mono">
                      This demo page uses the Layout component with LayoutHeader,
                      LayoutSidebar, and LayoutMain subcomponents.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>
        </div>
      </LayoutMain>
    </Layout>
  );
};

export default DemoPage;
