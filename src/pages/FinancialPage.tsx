import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarbonCreditPortfolio } from '@/components/Financial/CarbonCreditPortfolio';
import { ROIDashboard } from '@/components/Financial/ROIDashboard';
import { CarbonPriceWidget } from '@/components/Financial/CarbonPriceWidget';
import { DollarSign, Leaf, TrendingUp } from 'lucide-react';

export default function FinancialPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <p className="text-muted-foreground">
          Track ROI, manage carbon credits, and monitor financial performance
        </p>
      </div>

      <Tabs defaultValue="roi" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roi" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ROI Tracking
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Carbon Credits
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Market Prices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roi">
          <ROIDashboard />
        </TabsContent>

        <TabsContent value="credits">
          <CarbonCreditPortfolio />
        </TabsContent>

        <TabsContent value="prices">
          <div className="max-w-md">
            <CarbonPriceWidget />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
