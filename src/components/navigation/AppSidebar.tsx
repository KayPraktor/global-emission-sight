import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Atom,
  BarChart3,
  ClipboardList,
  Home,
  MonitorSmartphone,
  FileSpreadsheet,
  Settings,
  Zap,
  HelpCircle,
  Target,
  Building2
} from 'lucide-react';

import { 
  Sidebar,
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/' },
    { name: 'Enterprise', icon: <Building2 className="h-4 w-4" />, path: '/enterprise' },
    { name: 'Data Entry', icon: <ClipboardList className="h-4 w-4" />, path: '/data-entry' },
    { name: 'Reports', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/reports' },
    { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/analytics' },
    { name: 'Goals', icon: <Target className="h-4 w-4" />, path: '/goals' },
    { name: 'Monitoring', icon: <MonitorSmartphone className="h-4 w-4" />, path: '/monitoring' },
    { name: 'AI Assistant', icon: <Zap className="h-4 w-4" />, path: '/ai-assistant' },
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Atom className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">BARYON</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive(item.path)}
                tooltip={item.name}
              >
                <Link to={item.path}>
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4 text-sidebar-foreground/70" />
            <span className="text-sm text-sidebar-foreground/70">Help & Support</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
