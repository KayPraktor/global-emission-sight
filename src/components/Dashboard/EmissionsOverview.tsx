
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart3, CloudRain, Factory, Truck } from 'lucide-react';
import { calculateTotal, calculateTotalByScope } from '@/utils/dummyData';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';
import { motion } from 'framer-motion';

const EmissionsOverview: React.FC = () => {
  const scope1Total = calculateTotalByScope('Scope 1');
  const scope2Total = calculateTotalByScope('Scope 2');
  const scope3Total = calculateTotalByScope('Scope 3');
  const totalEmissions = calculateTotal();
  
  // Fictitious previous period data to show trends
  const previousTotal = totalEmissions * 1.08; // 8% higher before
  const previousScope1 = scope1Total * 1.05;
  const previousScope2 = scope2Total * 1.12;
  const previousScope3 = scope3Total * 0.95;
  
  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };
  
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full" />
          <h3 className="text-2xl font-luxury font-semibold text-foreground">
            Emissions Intelligence
          </h3>
        </div>
        <SampleDataBadge />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Emissions - Premium Hero Card */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="relative overflow-hidden glass-luxury-card shadow-luxury-lg h-full">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#047857]/20 to-[#34d399]/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            {/* Metallic Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]" />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Total Impact
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-4xl font-display font-bold text-foreground">
                  {formatNumber(totalEmissions)}
                  <span className="text-2xl font-body font-normal text-muted-foreground ml-2">
                    tCO₂e
                  </span>
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                    <ArrowDownRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {Math.abs(calculateChange(totalEmissions, previousTotal)).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    vs. previous period
                  </span>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#10b981]/10 to-transparent rounded-tl-full" />
            </CardContent>
          </Card>
        </motion.div>
      
      <Card className="stat-card">
        <CardContent className="p-6 relative overflow-hidden glass-luxury-card shadow-luxury-lg">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]" />
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 1 Emissions</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/10">
              <Factory className="text-[#ef4444] h-5 w-5" />
            </div>
          </div>
          <p className="stat-value">{formatNumber(scope1Total)} tCO₂e</p>
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope1Total, previousScope1)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6 relative overflow-hidden glass-luxury-card shadow-luxury-lg">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]" />
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 2 Emissions</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/10">
              <CloudRain className="text-[#3b82f6] h-5 w-5" />
            </div>
          </div>
          <p className="stat-value">{formatNumber(scope2Total)} tCO₂e</p>
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope2Total, previousScope2)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6 relative overflow-hidden glass-luxury-card shadow-luxury-lg">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37]" />
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 3 Emissions</span>
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/10">
              <Truck className="text-[#10b981] h-5 w-5" />
            </div>
          </div>
          <p className="stat-value">{formatNumber(scope3Total)} tCO₂e</p>
          <div className="stat-trend-up">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope3Total, previousScope3)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default EmissionsOverview;
