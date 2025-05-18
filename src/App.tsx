
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

import Index from "./pages/Index";
import DataEntryPage from "./pages/DataEntryPage";
import ReportsPage from "./pages/ReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MonitoringPage from "./pages/MonitoringPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import GoalsPage from "./pages/GoalsPage";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="baryon-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SidebarProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
                  <Route path="/data-entry" element={<DashboardLayout><DataEntryPage /></DashboardLayout>} />
                  <Route path="/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
                  <Route path="/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
                  <Route path="/goals" element={<DashboardLayout><GoalsPage /></DashboardLayout>} />
                  <Route path="/monitoring" element={<DashboardLayout><MonitoringPage /></DashboardLayout>} />
                  <Route path="/ai-assistant" element={<DashboardLayout><AIAssistantPage /></DashboardLayout>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
