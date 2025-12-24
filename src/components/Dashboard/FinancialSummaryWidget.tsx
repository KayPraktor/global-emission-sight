import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Leaf, Clock } from 'lucide-react';
import { carbonCreditService } from '@/services/carbonCreditService';
import { roiTrackingService } from '@/services/roiTrackingService';
import { startOfMonth, endOfMonth } from 'date-fns';

interface FinancialSummaryData {
  portfolioValue: number;
  monthlyROI: number;
  roiPercentage: number;
  creditCount: number;
  timeSaved: number;
}

export function FinancialSummaryWidget() {
  const [data, setData] = useState<FinancialSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [portfolioSummary, currentROI] = await Promise.all([
        carbonCreditService.getPortfolioSummary(),
        roiTrackingService.calculatePeriodROI(
          startOfMonth(new Date()),
          endOfMonth(new Date()),
          'monthly'
        ),
      ]);

      setData({
        portfolioValue: portfolioSummary.totalValue,
        monthlyROI: currentROI.totalValue - currentROI.platformCost,
        roiPercentage: currentROI.roiPercentage,
        creditCount: portfolioSummary.totalCredits,
        timeSaved: currentROI.timeSavedHours,
      });
    } catch (error) {
      console.error('Failed to load financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Portfolio Value</span>
          </div>
          <span className="font-semibold">{formatCurrency(data?.portfolioValue || 0)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Monthly ROI</span>
          </div>
          <div className="text-right">
            <span className={`font-semibold ${(data?.monthlyROI || 0) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              {formatCurrency(data?.monthlyROI || 0)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({(data?.roiPercentage || 0).toFixed(0)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-teal-500/10">
              <Leaf className="h-4 w-4 text-teal-500" />
            </div>
            <span className="text-sm text-muted-foreground">Carbon Credits</span>
          </div>
          <span className="font-semibold">{(data?.creditCount || 0).toLocaleString()} tCO₂e</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-muted-foreground">Time Saved</span>
          </div>
          <span className="font-semibold">{(data?.timeSaved || 0).toFixed(1)} hrs</span>
        </div>
      </CardContent>
    </Card>
  );
}
