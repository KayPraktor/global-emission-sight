import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
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
import SettingsPage from "./pages/SettingsPage";
import ROICalculator from "./pages/ROICalculator";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import AuditPage from "./pages/AuditPage";
import FinancialPage from "./pages/FinancialPage";
import Scope3Page from "./pages/Scope3Page";
import SuppliersPage from "./pages/SuppliersPage";
import CompliancePage from "./pages/CompliancePage";
import BoardReportingPage from "./pages/BoardReportingPage";
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
          <OnboardingProvider>
          <Router>
            <Routes>
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/roi-calculator" element={<ROICalculator />} />
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
                          <Route path="/goals" element={<GoalsPage />} />
                          <Route path="/emission-factors" element={<EmissionFactorsPage />} />
                          <Route path="/scenario-planning" element={<ScenarioPlanningPage />} />
                          <Route path="/admin" element={<AdminPage />} />
                          <Route path="/approvals" element={<ApprovalsPage />} />
                          <Route path="/audit" element={<AuditPage />} />
                          <Route path="/financial" element={<FinancialPage />} />
                          <Route path="/scope3" element={<Scope3Page />} />
                          <Route path="/suppliers" element={<SuppliersPage />} />
                          <Route path="/compliance" element={<CompliancePage />} />
                          <Route path="/board-reporting" element={<BoardReportingPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
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
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
