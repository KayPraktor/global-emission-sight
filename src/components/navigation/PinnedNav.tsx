import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Pin } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { NavItem } from './SidebarSection';

interface PinnedNavProps {
  pinnedPaths: string[];
  allItems: NavItem[];
  onUnpin: (path: string) => void;
}

export function PinnedNav({ pinnedPaths, allItems, onUnpin }: PinnedNavProps) {
  const location = useLocation();

  if (pinnedPaths.length === 0) return null;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Get the full item details for pinned paths
  const pinnedItems = pinnedPaths
    .map(path => allItems.find(item => item.path === path))
    .filter(Boolean) as NavItem[];

  if (pinnedItems.length === 0) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <Star className="h-3 w-3 text-primary fill-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Quick Access
        </span>
      </div>
      
      <SidebarMenu>
        {pinnedItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <SidebarMenuItem className="relative">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.description || item.name}
                    className="py-2.5 h-auto"
                  >
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center justify-between w-full relative",
                        "bg-sidebar-accent/20 hover:bg-sidebar-accent/40"
                      )}
                    >
                      {isActive(item.path) && (
                        <motion.div
                          layoutId="sidebar-pinned-active"
                          className="absolute inset-0 bg-sidebar-accent rounded-md"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="flex items-center gap-3 relative z-10">
                        <span className="flex items-center justify-center w-5 h-5 shrink-0 text-sidebar-foreground/70">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
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
                <ContextMenuItem onClick={() => onUnpin(item.path)}>
                  <Pin className="h-4 w-4 mr-2" />
                  Remove from Quick Access
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </motion.div>
        ))}
      </SidebarMenu>
      
      <div className="mx-3 my-2 border-t border-sidebar-border/50" />
    </div>
  );
}
