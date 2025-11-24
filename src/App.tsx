import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Index from "./pages/Index";
import EnterpriseIndex from "./pages/EnterpriseIndex";
import DataEntryPage from "./pages/DataEntryPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import GoalsPage from "./pages/GoalsPage";
import ReportsPage from "./pages/ReportsPage";
import AdvancedAnalyticsPage from "./pages/AdvancedAnalyticsPage";
import ScenarioPlanningPage from "./pages/ScenarioPlanningPage";
import EmissionFactorsPage from "./pages/EmissionFactorsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";

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
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <DashboardLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/enterprise" element={<EnterpriseIndex />} />
                          <Route path="/data-entry" element={<DataEntryPage />} />
                          <Route path="/facilities" element={<FacilitiesPage />} />
                          <Route path="/reports" element={<ReportsPage />} />
                          
                <Route path="/analytics" element={<AdvancedAnalyticsPage />} />
                <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} /> {/* Legacy redirect */}
                          <Route path="/goals" element={<GoalsPage />} />
                          <Route path="/emission-factors" element={<EmissionFactorsPage />} />
                          <Route path="/scenario-planning" element={<ScenarioPlanningPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </DashboardLayout>
                    </SidebarProvider>
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
