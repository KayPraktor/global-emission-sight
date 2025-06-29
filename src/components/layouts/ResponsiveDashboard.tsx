
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { MobileNavigation, MobileBottomNav } from '@/components/navigation/MobileNavigation';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveSection } from '@/components/ui/responsive-layout';
import { CollapsibleSidebarLayout, TabLayout } from '@/components/ui/advanced-layout';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Menu,
  Bell,
  Search
} from 'lucide-react';

interface ResponsiveDashboardProps {
  children: React.ReactNode;
}

export function ResponsiveDashboard({ children }: ResponsiveDashboardProps) {
  const { isMobile, isTablet, screenSize } = useResponsiveLayout();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const dashboardTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      content: children
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: '3',
      content: <div>Analytics Content</div>
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="w-4 h-4" />,
      content: <div>Team Content</div>
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target className="w-4 h-4" />,
      content: <div>Goals Content</div>
    }
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MobileNavigation />
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">B</span>
                </div>
                <span className="font-semibold text-lg">BARYON</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <main className="pb-20 px-4 py-6">
          <TabLayout
            tabs={dashboardTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
            className="mb-6"
          />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <CollapsibleSidebarLayout
            sidebar={<AppSidebar />}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarWidth="16"
            collapsedWidth="4"
          >
            <div className="flex flex-col h-full">
              <header className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </header>
              
              <main className="flex-1 overflow-auto p-6">
                <ResponsiveContainer maxWidth="full" padding="none">
                  <TabLayout
                    tabs={dashboardTabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    variant="underline"
                  />
                </ResponsiveContainer>
              </main>
            </div>
          </CollapsibleSidebarLayout>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <CollapsibleSidebarLayout
          sidebar={<AppSidebar />}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarWidth="16"
          collapsedWidth="4"
        >
          <div className="flex flex-col h-full">
            <header className="border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </header>
            
            <main className="flex-1 overflow-auto p-6">
              <ResponsiveContainer maxWidth="full" padding="none">
                <TabLayout
                  tabs={dashboardTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  variant="underline"
                />
              </ResponsiveContainer>
            </main>
          </div>
        </CollapsibleSidebarLayout>
      </div>
    </div>
  );
}
