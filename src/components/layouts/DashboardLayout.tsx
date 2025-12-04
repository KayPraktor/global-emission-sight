

import React from 'react';
import { Link } from 'react-router-dom';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { BreadcrumbNav } from '@/components/navigation/BreadcrumbNav';
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Sidebar, SidebarContent, SidebarInset, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Atom, HelpCircle, Menu, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { open, setOpen } = useCommandPalette();
  
  return (
    <div className="flex min-h-screen w-full bg-sidebar">
      <AppSidebar />
      <SidebarRail />
      
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <Link to="/" className="text-primary text-xl font-bold flex items-center">
                <Atom className="h-6 w-6 mr-2" />
                <span>
                  BARY
                  <span className="inline-block w-0 relative">
                    <span className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
                  </span>
                  ON
                </span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setOpen(true)}
                      className="hidden md:flex"
                    >
                      <Command className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Command Palette (⌘K)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <NotificationBell />
              <Separator orientation="vertical" className="h-6" />
              <ThemeToggle />
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <BreadcrumbNav />
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
          
          <footer className="border-t border-border py-4 px-6 bg-background">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">© 2025 BARYON. All rights reserved.</p>
              <div className="flex space-x-4 mt-2 md:mt-0">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </div>
        
        <CommandPalette open={open} onOpenChange={setOpen} />
        <FloatingActionButton />
      </SidebarInset>
    </div>
  );
}
