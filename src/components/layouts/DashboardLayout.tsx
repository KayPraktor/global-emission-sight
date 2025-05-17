
import React from 'react';
import { Link } from 'react-router-dom';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Sidebar, SidebarContent, SidebarInset, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Atom, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen w-full bg-sidebar">
      <AppSidebar />
      <SidebarRail />
      
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <Link to="/" className="text-primary text-xl font-bold flex items-center">
                <Atom className="h-6 w-6 mr-2" />
                BARYON
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <NotificationBell />
              <Separator orientation="vertical" className="h-6" />
              <ThemeToggle />
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="animate-fade-in">
              {children}
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
      </SidebarInset>
    </div>
  );
}
