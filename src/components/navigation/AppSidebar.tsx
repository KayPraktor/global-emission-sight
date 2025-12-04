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
  LineChart,
  Shield
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
  const { user, signOut, isAdmin, organization } = useAuth();
  
  const navItems = [
    // OVERVIEW
    { name: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/', section: 'overview' },
    { name: 'Executive', icon: <Building2 className="h-4 w-4" />, path: '/enterprise', section: 'overview' },
    
    // DATA MANAGEMENT
    { name: 'Data Entry', icon: <ClipboardList className="h-4 w-4" />, path: '/data-entry', section: 'data' },
    { name: 'Facilities', icon: <Building2 className="h-4 w-4" />, path: '/facilities', section: 'data' },
    { name: 'Emission Factors', icon: <Database className="h-4 w-4" />, path: '/emission-factors', section: 'data' },
    
    // ANALYSIS & PLANNING
    { name: 'Analytics', icon: <LineChart className="h-4 w-4" />, path: '/analytics', section: 'analysis' },
    { name: 'Scenario Planning', icon: <TrendingUp className="h-4 w-4" />, path: '/scenario-planning', section: 'analysis' },
    { name: 'Goals', icon: <Target className="h-4 w-4" />, path: '/goals', section: 'analysis' },
    
    // REPORTING
    { name: 'Reports', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/reports', section: 'reporting' },
    
    // ADMINISTRATION
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings', section: 'admin' },
  ];

  const adminNavItems = [
    { name: 'Admin', icon: <Shield className="h-4 w-4" />, path: '/admin' },
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
          <span className="font-semibold text-xl">
            BARY
            <span className="inline-block w-0 relative">
              <span className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
            </span>
            ON
          </span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {/* Overview Section */}
          <div className="px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Overview</span>
          </div>
          {navItems.filter(item => item.section === 'overview').map((item) => (
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
          
          {/* Data Management Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Data Management</span>
          </div>
          {navItems.filter(item => item.section === 'data').map((item) => (
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
          
          {/* Analysis & Planning Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Analysis & Planning</span>
          </div>
          {navItems.filter(item => item.section === 'analysis').map((item) => (
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
          
          {/* Reporting Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Reporting</span>
          </div>
          {navItems.filter(item => item.section === 'reporting').map((item) => (
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
          
          {/* Administration Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Administration</span>
          </div>
          {navItems.filter(item => item.section === 'admin').map((item) => (
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
          
          {isAdmin && adminNavItems.map((item) => (
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
                {organization && (
                  <p className="text-xs text-muted-foreground truncate">{organization.name}</p>
                )}
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
