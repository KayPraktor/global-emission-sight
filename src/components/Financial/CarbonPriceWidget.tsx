import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { carbonCreditService, CarbonPrice } from '@/services/carbonCreditService';
import { toast } from 'sonner';

export function CarbonPriceWidget() {
  const [prices, setPrices] = useState<CarbonPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await carbonCreditService.getAllMarketPrices();
      setPrices(data);
    } catch (error) {
      console.error('Failed to load prices:', error);
      toast.error('Failed to load carbon prices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Trend icon removed — no historical data available for real comparison

  const getPriceLabel = (priceType: string): string => {
    const labels: Record<string, string> = {
      EUA: 'EU Allowances',
      VCU: 'Verified Carbon Units',
      CER: 'Certified Emission Reductions',
      GCC: 'Gold Standard Credits',
      ACR: 'American Carbon Registry',
    };
    return labels[priceType] || priceType;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Carbon Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Carbon Prices
          <Badge variant="outline" className="font-normal">
            Market Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.map((price) => (
            <div 
              key={price.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-medium text-sm">{price.price_type}</p>
                  <p className="text-xs text-muted-foreground">{getPriceLabel(price.price_type)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(price.price_per_tonne)}</p>
                <p className="text-xs text-muted-foreground">/tCO₂e</p>
              </div>
            </div>
          ))}
          {prices.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No price data available
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
