import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Index from '@/pages/Index';
import EnterpriseIndex from '@/pages/EnterpriseIndex';
import DataEntryPage from '@/pages/DataEntryPage';
import ReportsPage from '@/pages/ReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import GoalsPage from '@/pages/GoalsPage';
import MonitoringPage from '@/pages/MonitoringPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <SidebarProvider>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/enterprise" element={<EnterpriseIndex />} />
                <Route path="/data-entry" element={<DataEntryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/monitoring" element={<MonitoringPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          </SidebarProvider>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
