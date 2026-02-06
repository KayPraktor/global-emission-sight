import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { SessionExpiryHandler } from '@/components/ui/session-expiry-handler';
import { SkipToContent } from '@/components/ui/skip-to-content';
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
import MaterialityPage from "./pages/MaterialityPage";

// Network status wrapper component
const NetworkStatusWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  
  return (
    <>
      <OfflineBanner isOffline={!isOnline} isSlowConnection={isSlowConnection} />
      <div className={!isOnline ? 'pt-16' : ''}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <OnboardingProvider>
              <Router>
                <SkipToContent />
                <NetworkStatusWrapper>
                  <SessionExpiryHandler>
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
                                  <Route path="/materiality" element={<MaterialityPage />} />
                                  <Route path="/settings" element={<SettingsPage />} />
                                  <Route path="*" element={<NotFound />} />
                                </Routes>
                              </DashboardLayout>
                            </SidebarProvider>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </SessionExpiryHandler>
                </NetworkStatusWrapper>
              </Router>
              <Toaster />
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
