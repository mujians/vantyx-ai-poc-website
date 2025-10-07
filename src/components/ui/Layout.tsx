import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-background ${className}`.trim()}>
      <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

interface LayoutHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({ children, className = '' }) => {
  return (
    <header className={`col-span-1 lg:col-span-12 ${className}`.trim()}>
      {children}
    </header>
  );
};

interface LayoutSidebarProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutSidebar: React.FC<LayoutSidebarProps> = ({ children, className = '' }) => {
  return (
    <aside className={`col-span-1 lg:col-span-3 ${className}`.trim()}>
      {children}
    </aside>
  );
};

interface LayoutMainProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutMain: React.FC<LayoutMainProps> = ({ children, className = '' }) => {
  return (
    <main className={`col-span-1 lg:col-span-9 ${className}`.trim()}>
      {children}
    </main>
  );
};

interface LayoutFooterProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutFooter: React.FC<LayoutFooterProps> = ({ children, className = '' }) => {
  return (
    <footer className={`col-span-1 lg:col-span-12 ${className}`.trim()}>
      {children}
    </footer>
  );
};

Layout.displayName = 'Layout';
LayoutHeader.displayName = 'LayoutHeader';
LayoutSidebar.displayName = 'LayoutSidebar';
LayoutMain.displayName = 'LayoutMain';
LayoutFooter.displayName = 'LayoutFooter';

export { Layout, LayoutHeader, LayoutSidebar, LayoutMain, LayoutFooter };
export default Layout;
