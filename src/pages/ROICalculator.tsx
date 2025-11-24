import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, Clock, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CostInputs {
  consultantFees: number;
  fteHours: number;
  hourlyRate: number;
  missedDeadlines: number;
  auditPrepCosts: number;
  manualDataHours: number;
  compliancePenalties: number;
}

export default function ROICalculator() {
  const [inputs, setInputs] = useState<CostInputs>({
    consultantFees: 50000,
    fteHours: 520, // ~10 hours/week
    hourlyRate: 75,
    missedDeadlines: 2,
    auditPrepCosts: 25000,
    manualDataHours: 260, // ~5 hours/week
    compliancePenalties: 0,
  });

  const calculations = useMemo(() => {
    // Current annual costs
    const currentCosts = {
      consultants: inputs.consultantFees,
      fteTime: inputs.fteHours * inputs.hourlyRate,
      deadlines: inputs.missedDeadlines * 15000, // Avg cost per missed deadline
      auditPrep: inputs.auditPrepCosts,
      manualData: inputs.manualDataHours * inputs.hourlyRate,
      penalties: inputs.compliancePenalties,
    };

    const totalCurrentCost = Object.values(currentCosts).reduce((a, b) => a + b, 0);

    // Platform savings (conservative estimates)
    const savings = {
      consultants: currentCosts.consultants * 0.7, // 70% reduction in consultant needs
      fteTime: currentCosts.fteTime * 0.6, // 60% time savings through automation
      deadlines: currentCosts.deadlines * 0.9, // 90% reduction in missed deadlines
      auditPrep: currentCosts.auditPrep * 0.5, // 50% reduction in audit prep time
      manualData: currentCosts.manualData * 0.8, // 80% reduction in manual data entry
      penalties: currentCosts.penalties * 0.85, // 85% reduction in compliance risks
    };

    const totalAnnualSavings = Object.values(savings).reduce((a, b) => a + b, 0);
    
    // Platform cost (example pricing)
    const platformCost = 15000; // Annual subscription
    
    const netAnnualSavings = totalAnnualSavings - platformCost;
    const paybackMonths = platformCost / (totalAnnualSavings / 12);
    const threeYearROI = ((netAnnualSavings * 3) / platformCost) * 100;
    const threeYearSavings = netAnnualSavings * 3;

    // Year-over-year projection
    const yearlyData = [
      { year: 'Year 1', savings: netAnnualSavings, cumulative: netAnnualSavings },
      { year: 'Year 2', savings: netAnnualSavings, cumulative: netAnnualSavings * 2 },
      { year: 'Year 3', savings: netAnnualSavings, cumulative: netAnnualSavings * 3 },
    ];

    // Breakdown comparison
    const comparisonData = [
      { category: 'Consultants', current: currentCosts.consultants, withPlatform: currentCosts.consultants - savings.consultants },
      { category: 'FTE Time', current: currentCosts.fteTime, withPlatform: currentCosts.fteTime - savings.fteTime },
      { category: 'Missed Deadlines', current: currentCosts.deadlines, withPlatform: currentCosts.deadlines - savings.deadlines },
      { category: 'Audit Prep', current: currentCosts.auditPrep, withPlatform: currentCosts.auditPrep - savings.auditPrep },
      { category: 'Manual Data', current: currentCosts.manualData, withPlatform: currentCosts.manualData - savings.manualData },
      { category: 'Penalties', current: currentCosts.penalties, withPlatform: currentCosts.penalties - savings.penalties },
    ];

    return {
      totalCurrentCost,
      totalAnnualSavings,
      platformCost,
      netAnnualSavings,
      paybackMonths,
      threeYearROI,
      threeYearSavings,
      yearlyData,
      comparisonData,
      currentCosts,
      savings,
    };
  }, [inputs]);

  const handleInputChange = (field: keyof CostInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(0)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">ROI Calculator</h1>
          </div>
          <p className="text-muted-foreground">
            Calculate your potential savings and return on investment with our platform
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Current Costs</CardTitle>
              <CardDescription>Enter your annual expenses related to carbon management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="consultantFees">Annual Consultant Fees</Label>
                <Input
                  id="consultantFees"
                  type="number"
                  value={inputs.consultantFees}
                  onChange={(e) => handleInputChange('consultantFees', e.target.value)}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fteHours">Annual FTE Hours (Carbon Reporting)</Label>
                <Input
                  id="fteHours"
                  type="number"
                  value={inputs.fteHours}
                  onChange={(e) => handleInputChange('fteHours', e.target.value)}
                  placeholder="520"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Average Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={inputs.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="missedDeadlines">Missed Deadlines Per Year</Label>
                <Input
                  id="missedDeadlines"
                  type="number"
                  value={inputs.missedDeadlines}
                  onChange={(e) => handleInputChange('missedDeadlines', e.target.value)}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditPrepCosts">Annual Audit Preparation Costs</Label>
                <Input
                  id="auditPrepCosts"
                  type="number"
                  value={inputs.auditPrepCosts}
                  onChange={(e) => handleInputChange('auditPrepCosts', e.target.value)}
                  placeholder="25000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualDataHours">Manual Data Entry Hours/Year</Label>
                <Input
                  id="manualDataHours"
                  type="number"
                  value={inputs.manualDataHours}
                  onChange={(e) => handleInputChange('manualDataHours', e.target.value)}
                  placeholder="260"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compliancePenalties">Compliance Penalties (if any)</Label>
                <Input
                  id="compliancePenalties"
                  type="number"
                  value={inputs.compliancePenalties}
                  onChange={(e) => handleInputChange('compliancePenalties', e.target.value)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Current Annual Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(calculations.totalCurrentCost)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calculations.netAnnualSavings)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Payback Period</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {calculations.paybackMonths.toFixed(1)} months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">3-Year ROI</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatPercent(calculations.threeYearROI)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3-Year Projection */}
            <Card>
              <CardHeader>
                <CardTitle>3-Year Cumulative Savings</CardTitle>
                <CardDescription>
                  Total projected savings: {formatCurrency(calculations.threeYearSavings)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculations.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Cumulative Savings"
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown: Current vs. With Platform</CardTitle>
                <CardDescription>See where you'll save the most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={calculations.comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      className="text-xs"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar dataKey="current" fill="hsl(var(--destructive))" name="Current Cost" />
                    <Bar dataKey="withPlatform" fill="hsl(var(--primary))" name="With Platform" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Annual Savings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Consultant Fees (70% reduction)</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculations.savings.consultants)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">FTE Time Savings (60% reduction)</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculations.savings.fteTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Missed Deadlines (90% reduction)</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculations.savings.deadlines)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Audit Preparation (50% reduction)</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculations.savings.auditPrep)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Manual Data Entry (80% reduction)</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(calculations.savings.manualData)}
                    </span>
                  </div>
                  {calculations.savings.penalties > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Compliance Penalties (85% reduction)</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(calculations.savings.penalties)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-foreground">Total Annual Savings</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(calculations.totalAnnualSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Platform Cost</span>
                    <span className="text-foreground">
                      -{formatCurrency(calculations.platformCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-primary">
                    <span className="font-bold text-foreground">Net Annual Benefit</span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrency(calculations.netAnnualSavings)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold">
                    Ready to save {formatCurrency(calculations.netAnnualSavings)} annually?
                  </h3>
                  <p className="text-primary-foreground/90">
                    Join leading organizations in automating their carbon management
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button size="lg" variant="secondary">
                      Schedule Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
