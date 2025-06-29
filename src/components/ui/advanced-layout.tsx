
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Split Layout Component
export const SplitLayout: React.FC<{
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  responsive?: boolean;
}> = ({ 
  leftPanel, 
  rightPanel, 
  leftWidth = '1/2', 
  rightWidth = '1/2',
  gap = 'md',
  className = '',
  responsive = true
}) => {
  const isMobile = useIsMobile();
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  if (responsive && isMobile) {
    return (
      <div className={cn('flex flex-col', gapClasses[gap], className)}>
        <div>{leftPanel}</div>
        <div>{rightPanel}</div>
      </div>
    );
  }

  return (
    <div className={cn('flex', gapClasses[gap], className)}>
      <div className={`w-${leftWidth}`}>{leftPanel}</div>
      <div className={`w-${rightWidth}`}>{rightPanel}</div>
    </div>
  );
};

// Masonry Layout Component
export const MasonryLayout: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ children, columns = 3, gap = 'md', className = '' }) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div 
      className={cn('columns-1 md:columns-2 lg:columns-3', gapClasses[gap], className)}
      style={{ columnCount: columns }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="break-inside-avoid mb-6"
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// Sticky Layout Component
export const StickyLayout: React.FC<{
  children: React.ReactNode;
  stickyContent: React.ReactNode;
  stickyPosition?: 'top' | 'bottom';
  offset?: string;
  className?: string;
}> = ({ 
  children, 
  stickyContent, 
  stickyPosition = 'top',
  offset = '0',
  className = '' 
}) => {
  const stickyClasses = {
    top: 'sticky top-0',
    bottom: 'sticky bottom-0'
  };

  return (
    <div className={cn('relative', className)}>
      <div 
        className={cn(stickyClasses[stickyPosition], 'z-10')}
        style={{ [stickyPosition]: offset }}
      >
        {stickyContent}
      </div>
      <div>{children}</div>
    </div>
  );
};

// Collapsible Sidebar Layout
export const CollapsibleSidebarLayout: React.FC<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  sidebarWidth?: string;
  collapsedWidth?: string;
  className?: string;
}> = ({ 
  children, 
  sidebar, 
  isCollapsed, 
  onToggle,
  sidebarWidth = '64',
  collapsedWidth = '16',
  className = '' 
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex h-full', className)}>
      <motion.div
        initial={false}
        animate={{ 
          width: isCollapsed ? `${collapsedWidth}rem` : `${sidebarWidth}rem` 
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative bg-sidebar border-r border-border"
      >
        {sidebar}
      </motion.div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Tab Layout Component
export const TabLayout: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  variant = 'default' 
}) => {
  const isMobile = useIsMobile();

  const variantClasses = {
    default: 'border-b border-border',
    pills: 'bg-muted p-1 rounded-lg',
    underline: 'border-b border-border'
  };

  const tabClasses = {
    default: {
      base: 'px-4 py-2 font-medium text-sm transition-colors',
      active: 'text-primary border-b-2 border-primary',
      inactive: 'text-muted-foreground hover:text-foreground'
    },
    pills: {
      base: 'px-3 py-1.5 font-medium text-sm rounded-md transition-colors',
      active: 'bg-background text-foreground shadow-sm',
      inactive: 'text-muted-foreground hover:text-foreground'
    },
    underline: {
      base: 'px-4 py-2 font-medium text-sm transition-colors relative',
      active: 'text-primary',
      inactive: 'text-muted-foreground hover:text-foreground'
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn(
        'flex overflow-x-auto',
        variantClasses[variant],
        isMobile ? 'gap-2' : 'gap-4'
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              tabClasses[variant].base,
              activeTab === tab.id 
                ? tabClasses[variant].active 
                : tabClasses[variant].inactive,
              isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm',
              'flex items-center gap-2 whitespace-nowrap'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
            {variant === 'underline' && activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTabContent}
      </motion.div>
    </div>
  );
};
