import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Shield,
  ClipboardCheck,
  Wallet,
  ScrollText,
  Link2,
  Users,
  FileCheck,
  Presentation
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { approvalService } from '@/services/approvalService';
import { IndustryIndicator } from '@/components/navigation/IndustryIndicator';

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
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [isSupervisor, setIsSupervisor] = useState(false);

  useEffect(() => {
    const checkSupervisorAndPending = async () => {
      if (!user) return;
      const supervisor = await approvalService.isCurrentUserSupervisor();
      setIsSupervisor(supervisor);
      
      if (supervisor) {
        const count = await approvalService.getPendingApprovalCount();
        setPendingApprovals(count);
      }
    };

    checkSupervisorAndPending();
    // Refresh every 30 seconds
    const interval = setInterval(checkSupervisorAndPending, 30000);
    return () => clearInterval(interval);
  }, [user]);
  
  const navItems = [
    // OVERVIEW
    { name: 'Dashboard', icon: <Home className="h-4 w-4" />, path: '/', section: 'overview', description: 'Real-time emissions overview and KPIs' },
    { name: 'Executive', icon: <Building2 className="h-4 w-4" />, path: '/enterprise', section: 'overview', description: 'Strategic dashboards and Net Zero planning' },
    
    // DATA MANAGEMENT
    { name: 'Data Entry', icon: <ClipboardList className="h-4 w-4" />, path: '/data-entry', section: 'data', description: 'Record emissions data and activities' },
    { name: 'Approvals', icon: <ClipboardCheck className="h-4 w-4" />, path: '/approvals', section: 'data', badge: pendingApprovals, showBadge: isSupervisor, description: 'Review and approve data submissions' },
    { name: 'Facilities', icon: <Building2 className="h-4 w-4" />, path: '/facilities', section: 'data', description: 'Manage your sites and locations' },
    { name: 'Emission Factors', icon: <Database className="h-4 w-4" />, path: '/emission-factors', section: 'data', description: 'Conversion factors for calculations' },
    
    // ANALYSIS & PLANNING
    { name: 'Analytics', icon: <LineChart className="h-4 w-4" />, path: '/analytics', section: 'analysis', description: 'Trends, anomalies, and forecasting' },
    { name: 'Scope 3 & Supply Chain', icon: <Link2 className="h-4 w-4" />, path: '/scope3', section: 'analysis', description: 'Indirect emissions in your value chain' },
    { name: 'Suppliers', icon: <Users className="h-4 w-4" />, path: '/suppliers', section: 'analysis', description: 'Track supplier sustainability data' },
    { name: 'Scenario Planning', icon: <TrendingUp className="h-4 w-4" />, path: '/scenario-planning', section: 'analysis', description: 'Model reduction pathways' },
    { name: 'Goals', icon: <Target className="h-4 w-4" />, path: '/goals', section: 'analysis', description: 'Set and track reduction targets' },
    
    // REPORTING & COMPLIANCE
    { name: 'Reports', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/reports', section: 'reporting', description: 'Generate compliance reports' },
    { name: 'Board Reporting', icon: <Presentation className="h-4 w-4" />, path: '/board-reporting', section: 'reporting', description: 'Executive reports and governance' },
    { name: 'Compliance', icon: <FileCheck className="h-4 w-4" />, path: '/compliance', section: 'reporting', description: 'CSRD, ISSB and framework tracking' },
    { name: 'Materiality', icon: <BarChart3 className="h-4 w-4" />, path: '/materiality', section: 'reporting', description: 'Double materiality assessment' },
    { name: 'Audit Trail', icon: <ScrollText className="h-4 w-4" />, path: '/audit', section: 'reporting', description: 'Data change history and logs' },
    { name: 'Financial', icon: <Wallet className="h-4 w-4" />, path: '/financial', section: 'reporting', description: 'Carbon credits and pricing' },
    
    // ADMINISTRATION
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings', section: 'admin', description: 'Configure your preferences' },
  ];

  const adminNavItems = [
    { name: 'Admin', icon: <Shield className="h-4 w-4" />, path: '/admin' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: typeof navItems[0]) => (
    <SidebarMenuItem key={item.name} className="relative">
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
          </span>
          {item.showBadge && item.badge && item.badge > 0 && (
            <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 text-xs relative z-10">
              {item.badge > 99 ? '99+' : item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

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
          {/* Overview Section */}
          <div className="px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Overview</span>
          </div>
          {navItems.filter(item => item.section === 'overview').map(renderNavItem)}
          
          {/* Data Management Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Data Management</span>
          </div>
          {navItems.filter(item => item.section === 'data').map(renderNavItem)}
          
          {/* Analysis & Planning Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Analysis & Planning</span>
          </div>
          {navItems.filter(item => item.section === 'analysis').map(renderNavItem)}
          
          {/* Reporting Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Reporting</span>
          </div>
          {navItems.filter(item => item.section === 'reporting').map(renderNavItem)}
          
          {/* Administration Section */}
          <div className="px-3 py-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Administration</span>
          </div>
          {navItems.filter(item => item.section === 'admin').map(renderNavItem)}
          
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
        {user && organization && (
          <>
            <IndustryIndicator organizationId={organization.id} isAdmin={isAdmin} />
            <div className="my-3 border-t border-sidebar-border/50" />
          </>
        )}
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
