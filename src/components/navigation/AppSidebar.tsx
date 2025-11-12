import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Atom,
  BarChart3,
  ClipboardList,
  Home,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Target,
  Building2,
  LogOut,
  Database,
  TrendingUp,
  LineChart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  const { user, signOut } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/' },
    { name: 'Enterprise', icon: <Building2 className="h-4 w-4" />, path: '/enterprise' },
    { name: 'Data Entry', icon: <ClipboardList className="h-4 w-4" />, path: '/data-entry' },
    { name: 'Facilities', icon: <Building2 className="h-4 w-4" />, path: '/facilities' },
    { name: 'Emission Factors', icon: <Database className="h-4 w-4" />, path: '/emission-factors' },
    { name: 'Scenario Planning', icon: <TrendingUp className="h-4 w-4" />, path: '/scenario-planning' },
    { name: 'Reports', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/reports' },
    { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/analytics' },
    { name: 'Advanced Analytics', icon: <LineChart className="h-4 w-4" />, path: '/advanced-analytics' },
    { name: 'Goals', icon: <Target className="h-4 w-4" />, path: '/goals' },
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
      
      <SidebarFooter className="p-4 mt-auto border-t">
        {user && (
          <div className="space-y-3 mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-4 w-4 text-sidebar-foreground/70" />
          <span className="text-sm text-sidebar-foreground/70">Help & Support</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
