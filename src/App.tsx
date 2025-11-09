import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Index from '@/pages/Index';
import EnterpriseIndex from '@/pages/EnterpriseIndex';
import DataEntryPage from '@/pages/DataEntryPage';
import ReportsPage from '@/pages/ReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import GoalsPage from '@/pages/GoalsPage';
import MonitoringPage from '@/pages/MonitoringPage';
import MapPage from '@/pages/MapPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import FacilitiesPage from '@/pages/FacilitiesPage';
import AuthPage from '@/pages/AuthPage';
import OnboardingPage from '@/pages/OnboardingPage';
import NotFound from '@/pages/NotFound';
import { OnboardingCheck } from '@/components/auth/OnboardingCheck';

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
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <OnboardingCheck>
                      <SidebarProvider>
                        <DashboardLayout>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/enterprise" element={<EnterpriseIndex />} />
                            <Route path="/data-entry" element={<DataEntryPage />} />
                            <Route path="/facilities" element={<FacilitiesPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/map" element={<MapPage />} />
                            <Route path="/goals" element={<GoalsPage />} />
                            <Route path="/monitoring" element={<MonitoringPage />} />
                            <Route path="/ai-assistant" element={<AIAssistantPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </DashboardLayout>
                      </SidebarProvider>
                    </OnboardingCheck>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
