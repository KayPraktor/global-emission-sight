import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Pin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
  badge?: number;
  showBadge?: boolean;
}

interface SidebarSectionProps {
  id: string;
  title: string;
  items: NavItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  isPinned: (path: string) => boolean;
  onTogglePin: (path: string) => void;
}

export function SidebarSection({
  id,
  title,
  items,
  isCollapsed,
  onToggle,
  isPinned,
  onTogglePin,
}: SidebarSectionProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Calculate aggregate badge count for collapsed state
  const aggregateBadge = items.reduce((sum, item) => {
    if (item.showBadge && item.badge) return sum + item.badge;
    return sum;
  }, 0);

  // Check if any item in this section is active
  const hasActiveItem = items.some(item => isActive(item.path));

  return (
    <Collapsible open={!isCollapsed} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 mt-2 rounded-md",
            "text-xs font-semibold uppercase tracking-wider",
            "text-sidebar-foreground/50 hover:text-sidebar-foreground/70",
            "hover:bg-sidebar-accent/50 transition-colors duration-200",
            hasActiveItem && isCollapsed && "text-sidebar-foreground/80 bg-sidebar-accent/30"
          )}
        >
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-3 w-3" />
            </motion.div>
            {title}
          </span>
          {isCollapsed && aggregateBadge > 0 && (
            <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs">
              {aggregateBadge > 99 ? '99+' : aggregateBadge}
            </Badge>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent asChild forceMount>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ overflow: 'hidden' }}
            >
              <SidebarMenu>
                {items.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.15 }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <SidebarMenuItem className="relative">
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.path)}
                            tooltip={item.description || item.name}
                          >
                            <Link to={item.path} className="flex items-center justify-between w-full relative">
                              {isActive(item.path) && (
                                <motion.div
                                  layoutId="sidebar-active-indicator"
                                  className="absolute inset-0 bg-sidebar-accent rounded-md"
                                  initial={false}
                                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                              )}
                              <span className="flex items-center gap-2 relative z-10">
                                {item.icon}
                                <span>{item.name}</span>
                                {isPinned(item.path) && (
                                  <Pin className="h-3 w-3 text-primary/60" />
                                )}
                              </span>
                              {item.showBadge && item.badge && item.badge > 0 && (
                                <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs relative z-10">
                                  {item.badge > 99 ? '99+' : item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onTogglePin(item.path)}>
                          <Pin className="h-4 w-4 mr-2" />
                          {isPinned(item.path) ? 'Unpin from favorites' : 'Pin to favorites'}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}
