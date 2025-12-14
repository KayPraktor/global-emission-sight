
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Menu,
  Home,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
  Target,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations as t } from '@/lib/translations';

const navigationItems = [
  { name: t.navItems.dashboard, icon: Home, path: '/', color: 'text-blue-500' },
  { name: t.navItems.executive, icon: Building2, path: '/enterprise', color: 'text-purple-500' },
  { name: t.navItems.dataEntry, icon: ClipboardList, path: '/data-entry', color: 'text-green-500' },
  { name: t.navItems.reports, icon: FileSpreadsheet, path: '/reports', color: 'text-orange-500' },
  { name: t.navItems.analytics, icon: BarChart3, path: '/analytics', color: 'text-red-500' },
  { name: t.navItems.goals, icon: Target, path: '/goals', color: 'text-pink-500' },
  { name: t.navItems.settings, icon: Settings, path: '/settings', color: 'text-gray-500' },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ک</span>
              </div>
              <span className="font-semibold text-xl">{t.brand}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200',
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', item.color)} />
                    <span className="font-medium">{item.name}</span>
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="mr-auto w-2 h-2 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="px-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {t.quickActions.title}
                </h3>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <ClipboardList className="ml-2 h-4 w-4" />
                  {t.actions.newEntry}
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileSpreadsheet className="ml-2 h-4 w-4" />
                  {t.actions.generateReport}
                </Button>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                ک
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {t.mobile.userAccount}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  admin@company.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Bottom Navigation for Mobile
export function MobileBottomNav() {
  const location = useLocation();

  const bottomNavItems = [
    { name: t.mobile.home, icon: Home, path: '/' },
    { name: t.mobile.data, icon: ClipboardList, path: '/data-entry' },
    { name: t.navItems.reports, icon: FileSpreadsheet, path: '/reports' },
    { name: t.navItems.analytics, icon: BarChart3, path: '/analytics' },
    { name: t.mobile.more, icon: Menu, path: '/more' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <nav className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors duration-200',
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.name}</span>
            {isActive(item.path) && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
              />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
