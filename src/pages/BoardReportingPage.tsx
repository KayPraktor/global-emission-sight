import React from 'react';
import { BoardReportDashboard } from '@/components/BoardReporting/BoardReportDashboard';
import { Presentation, Building2 } from 'lucide-react';

const BoardReportingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Presentation className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Board Reporting</h1>
        </div>
        <p className="text-muted-foreground">
          Executive-ready sustainability reports, governance scorecards, and fiduciary duty tracking
        </p>
      </div>

      {/* Main Dashboard */}
      <BoardReportDashboard />
    </div>
  );
};

export default BoardReportingPage;
