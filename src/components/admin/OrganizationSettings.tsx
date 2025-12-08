import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, Save, Factory, Users, DollarSign, Ruler } from 'lucide-react';
import { industries } from '@/data/industryConfig';
import { SubIndustrySelector } from '@/components/onboarding/SubIndustrySelector';

export const OrganizationSettings = () => {
  const { organization, refreshUserData } = useAuth();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState<string>('');
  const [subIndustry, setSubIndustry] = useState<string | null>(null);
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [annualRevenue, setAnnualRevenue] = useState<string>('');
  const [squareFootage, setSquareFootage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      loadOrganizationData();
    }
  }, [organization]);

  const loadOrganizationData = async () => {
    if (!organization) return;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('name, industry, sub_industry, employee_count, annual_revenue_usd, square_footage')
        .eq('id', organization.id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name || '');
        setIndustry(data.industry || '');
        setSubIndustry(data.sub_industry || null);
        setEmployeeCount(data.employee_count?.toString() || '');
        setAnnualRevenue(data.annual_revenue_usd?.toString() || '');
        setSquareFootage(data.square_footage?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading organization data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organization || !name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          name: name.trim(),
          industry: industry || null,
          sub_industry: subIndustry || null,
          employee_count: employeeCount ? parseInt(employeeCount) : null,
          annual_revenue_usd: annualRevenue ? parseFloat(annualRevenue) : null,
          square_footage: squareFootage ? parseFloat(squareFootage) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success('Organization updated successfully');
      refreshUserData();
    } catch (error: any) {
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setSubIndustry(null); // Reset sub-industry when industry changes
  };

  if (initialLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-10 bg-muted rounded w-full max-w-md"></div>
        <div className="h-10 bg-muted rounded w-full max-w-md"></div>
      </div>
    );
  }

  const selectedIndustryConfig = industries.find(i => i.id === industry);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's information and industry configuration
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Organization Name */}
        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Enter organization name"
            />
          </div>
        </div>

        {/* Industry Selection */}
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select value={industry} onValueChange={handleIndustryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry">
                {selectedIndustryConfig && (
                  <div className="flex items-center gap-2">
                    <selectedIndustryConfig.icon className="h-4 w-4" />
                    {selectedIndustryConfig.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => {
                const Icon = ind.icon;
                return (
                  <SelectItem key={ind.id} value={ind.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {ind.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {selectedIndustryConfig && (
            <p className="text-xs text-muted-foreground">{selectedIndustryConfig.description}</p>
          )}
        </div>

        {/* Sub-Industry Selection */}
        {industry && (
          <SubIndustrySelector
            industry={industry}
            selectedSubIndustry={subIndustry}
            onSelect={setSubIndustry}
          />
        )}

        <div className="border-t pt-6 space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Organization Metrics (for benchmarking)
          </h3>

          {/* Employee Count */}
          <div className="space-y-2">
            <Label htmlFor="employee-count">Number of Employees</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="employee-count"
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="pl-10"
                placeholder="e.g., 500"
              />
            </div>
          </div>

          {/* Annual Revenue */}
          <div className="space-y-2">
            <Label htmlFor="annual-revenue">Annual Revenue (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="annual-revenue"
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className="pl-10"
                placeholder="e.g., 50000000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Used for emissions intensity calculations (tCO2e per $M revenue)</p>
          </div>

          {/* Square Footage */}
          <div className="space-y-2">
            <Label htmlFor="square-footage">Total Square Footage</Label>
            <div className="relative">
              <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="square-footage"
                type="number"
                value={squareFootage}
                onChange={(e) => setSquareFootage(e.target.value)}
                className="pl-10"
                placeholder="e.g., 100000"
              />
            </div>
            <p className="text-xs text-muted-foreground">Combined area of all facilities</p>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input value={organization?.id || ''} disabled className="font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label>Your Role</Label>
            <Input value={organization?.role || ''} disabled className="capitalize" />
          </div>
        </div>
      </div>
    </div>
  );
};
