import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Atom,
  LayoutDashboard,
  Gauge,
  PenLine,
  CheckCircle2,
  Factory,
  Calculator,
  TrendingUp,
  Network,
  Truck,
  Route,
  Target,
  FileText,
  Presentation,
  ShieldCheck,
  Scale,
  History,
  Coins,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { approvalService } from '@/services/approvalService';
import { IndustryIndicator } from '@/components/navigation/IndustryIndicator';
import { SidebarSection, type NavItem } from '@/components/navigation/SidebarSection';
import { PinnedNav } from '@/components/navigation/PinnedNav';
import { useSidebarPreferences } from '@/hooks/useSidebarPreferences';

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

interface SectionConfig {
  id: string;
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut, isAdmin, organization } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [isSupervisor, setIsSupervisor] = useState(false);
  
  const {
    preferences,
    toggleSection,
    isSectionCollapsed,
    expandSection,
    isPinned,
    togglePin,
    unpinItem,
  } = useSidebarPreferences();

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
    const interval = setInterval(checkSupervisorAndPending, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Define all navigation items with distinctive icons
  const allNavItems: NavItem[] = useMemo(() => [
    // Overview
    { name: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/', description: 'Real-time emissions overview and KPIs' },
    { name: 'Executive', icon: <Gauge className="h-4 w-4" />, path: '/enterprise', description: 'Strategic dashboards and Net Zero planning' },
    // Data Management
    { name: 'Data Entry', icon: <PenLine className="h-4 w-4" />, path: '/data-entry', description: 'Record emissions data and activities' },
    { name: 'Approvals', icon: <CheckCircle2 className="h-4 w-4" />, path: '/approvals', badge: pendingApprovals, showBadge: isSupervisor, description: 'Review and approve data submissions' },
    { name: 'Facilities', icon: <Factory className="h-4 w-4" />, path: '/facilities', description: 'Manage your sites and locations' },
    { name: 'Emission Factors', icon: <Calculator className="h-4 w-4" />, path: '/emission-factors', description: 'Conversion factors for calculations' },
    // Analysis & Planning
    { name: 'Analytics', icon: <TrendingUp className="h-4 w-4" />, path: '/analytics', description: 'Trends, anomalies, and forecasting' },
    { name: 'Scope 3 & Supply Chain', icon: <Network className="h-4 w-4" />, path: '/scope3', description: 'Indirect emissions in your value chain' },
    { name: 'Suppliers', icon: <Truck className="h-4 w-4" />, path: '/suppliers', description: 'Track supplier sustainability data' },
    { name: 'Scenario Planning', icon: <Route className="h-4 w-4" />, path: '/scenario-planning', description: 'Model reduction pathways' },
    { name: 'Goals', icon: <Target className="h-4 w-4" />, path: '/goals', description: 'Set and track reduction targets' },
    // Reporting
    { name: 'Reports', icon: <FileText className="h-4 w-4" />, path: '/reports', description: 'Generate compliance reports' },
    { name: 'Board Reporting', icon: <Presentation className="h-4 w-4" />, path: '/board-reporting', description: 'Executive reports and governance' },
    { name: 'Compliance', icon: <ShieldCheck className="h-4 w-4" />, path: '/compliance', description: 'CSRD, ISSB and framework tracking' },
    { name: 'Materiality', icon: <Scale className="h-4 w-4" />, path: '/materiality', description: 'Double materiality assessment' },
    { name: 'Audit Trail', icon: <History className="h-4 w-4" />, path: '/audit', description: 'Data change history and logs' },
    { name: 'Financial', icon: <Coins className="h-4 w-4" />, path: '/financial', description: 'Carbon credits and pricing' },
    // Admin
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/settings', description: 'Configure your preferences' },
  ], [pendingApprovals, isSupervisor]);

  // Define sections with their items
  const sections: SectionConfig[] = useMemo(() => [
    {
      id: 'overview',
      title: 'Overview',
      items: allNavItems.filter(item => ['/', '/enterprise'].includes(item.path)),
    },
    {
      id: 'data',
      title: 'Data Management',
      items: allNavItems.filter(item => 
        ['/data-entry', '/approvals', '/facilities', '/emission-factors'].includes(item.path)
      ),
    },
    {
      id: 'analysis',
      title: 'Analysis & Planning',
      items: allNavItems.filter(item => 
        ['/analytics', '/scope3', '/suppliers', '/scenario-planning', '/goals'].includes(item.path)
      ),
    },
    {
      id: 'reporting',
      title: 'Reporting',
      items: allNavItems.filter(item => 
        ['/reports', '/board-reporting', '/compliance', '/materiality', '/audit', '/financial'].includes(item.path)
      ),
    },
    {
      id: 'admin',
      title: 'Administration',
      items: allNavItems.filter(item => ['/settings'].includes(item.path)),
    },
  ], [allNavItems]);

  // Auto-expand section containing active route
  useEffect(() => {
    const currentPath = location.pathname;
    for (const section of sections) {
      const hasActiveItem = section.items.some(item => {
        if (item.path === '/') return currentPath === '/';
        return currentPath.startsWith(item.path);
      });
      if (hasActiveItem && isSectionCollapsed(section.id)) {
        expandSection(section.id);
        break;
      }
    }
  }, [location.pathname, sections, isSectionCollapsed, expandSection]);

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
        {/* Pinned Quick Access */}
        <PinnedNav
          pinnedPaths={preferences.pinnedItems}
          allItems={allNavItems}
          onUnpin={unpinItem}
        />

        {/* Collapsible Sections */}
        {sections.map(section => (
          <SidebarSection
            key={section.id}
            id={section.id}
            title={section.title}
            items={section.items}
            isCollapsed={isSectionCollapsed(section.id)}
            onToggle={() => toggleSection(section.id)}
            isPinned={isPinned}
            onTogglePin={togglePin}
          />
        ))}

        {/* Admin-only items */}
        {isAdmin && (
          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={isActive('/admin')}
                tooltip="Admin Panel"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
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
        <button 
          onClick={() => toast.info('Help & Support', { description: 'Contact support@baryon.app or visit our documentation.' })}
          className="flex items-center space-x-2 w-full hover:opacity-80 transition-opacity cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-sidebar-foreground/70" />
          <span className="text-sm text-sidebar-foreground/70">Help & Support</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
