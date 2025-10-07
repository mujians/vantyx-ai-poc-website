import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`font-mono text-2xl font-bold ${className}`}>
      [ V Λ N T Y ✕ ]
    </div>
  );
};
