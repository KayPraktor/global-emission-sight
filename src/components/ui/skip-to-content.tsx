import React from 'react';
import { cn } from '@/lib/utils';

export const SkipToContent: React.FC<{ targetId?: string }> = ({ targetId = 'main-content' }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground',
        'focus:rounded-md focus:shadow-lg focus:outline-none',
        'focus:ring-2 focus:ring-ring focus:ring-offset-2'
      )}
    >
      Skip to main content
    </a>
  );
};
