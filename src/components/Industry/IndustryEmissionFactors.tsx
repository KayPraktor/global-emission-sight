import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Factory, Zap, Landmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface IndustryEmissionFactor {
  id: string;
  industry: string;
  sub_industry: string | null;
  name: string;
  category: string;
  activity_type: string;
  scope: string;
  factor_value: number;
  unit: string;
  source: string;
  methodology: string | null;
  region: string;
  year: number;
  uncertainty: number | null;
  notes: string | null;
}

export function IndustryEmissionFactors() {
  const { organization } = useAuth();
  const [factors, setFactors] = useState<IndustryEmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orgIndustry, setOrgIndustry] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgIndustry = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('organizations')
        .select('industry')
        .eq('id', organization.id)
        .single();
      
      if (data?.industry) {
        setOrgIndustry(data.industry);
        setSelectedIndustry(data.industry);
      }
    };
    
    fetchOrgIndustry();
  }, [organization]);

  useEffect(() => {
    const fetchFactors = async () => {
      setLoading(true);
      let query = supabase
        .from('industry_emission_factors')
        .select('*')
        .order('industry')
        .order('category')
        .order('name');

      if (selectedIndustry !== 'all') {
        query = query.eq('industry', selectedIndustry);
      }
      if (selectedSubIndustry !== 'all') {
        query = query.eq('sub_industry', selectedSubIndustry);
      }

      const { data, error } = await query;
      if (!error && data) {
        setFactors(data);
      }
      setLoading(false);
    };

    fetchFactors();
  }, [selectedIndustry, selectedSubIndustry]);

  const industries = [...new Set(factors.map(f => f.industry))];
  const subIndustries = [...new Set(factors.filter(f => f.sub_industry).map(f => f.sub_industry!))];

  const filteredFactors = factors.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScopeBadgeVariant = (scope: string) => {
    switch (scope) {
      case 'scope_1': return 'default';
      case 'scope_2': return 'secondary';
      case 'scope_3': return 'outline';
      default: return 'default';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'manufacturing': return <Factory className="h-4 w-4" />;
      case 'energy_utilities': return <Zap className="h-4 w-4" />;
      case 'financial_services': return <Landmark className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatIndustryName = (industry: string) => {
    return industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Industry-Specific Emission Factors
          {orgIndustry && (
            <Badge variant="secondary" className="ml-2">
              Your Industry: {formatIndustryName(orgIndustry)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Specialized emission factors for your industry sector
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search factors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="energy_utilities">Energy & Utilities</SelectItem>
              <SelectItem value="financial_services">Financial Services</SelectItem>
            </SelectContent>
          </Select>
          {selectedIndustry !== 'all' && subIndustries.length > 0 && (
            <Select value={selectedSubIndustry} onValueChange={setSelectedSubIndustry}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Sub-Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Industries</SelectItem>
                {subIndustries
                  .filter(s => factors.some(f => f.sub_industry === s && (selectedIndustry === 'all' || f.industry === selectedIndustry)))
                  .map(sub => (
                    <SelectItem key={sub} value={sub}>
                      {sub.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Factor Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFactors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No emission factors found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredFactors.slice(0, 50).map((factor) => (
                  <TableRow key={factor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{factor.name}</p>
                        <p className="text-xs text-muted-foreground">{factor.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getIndustryIcon(factor.industry)}
                        <span className="text-sm">
                          {factor.sub_industry 
                            ? factor.sub_industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                            : formatIndustryName(factor.industry)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getScopeBadgeVariant(factor.scope)}>
                        {factor.scope.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {factor.factor_value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {factor.unit}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {factor.source}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredFactors.length > 50 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing 50 of {filteredFactors.length} factors. Use filters to narrow results.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
