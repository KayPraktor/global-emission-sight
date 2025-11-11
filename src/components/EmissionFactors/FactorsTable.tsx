import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmissionFactor } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { FactorVersionBadge } from './FactorVersionBadge';
import { FactorUpdateNotifications } from './FactorUpdateNotifications';

export const FactorsTable = () => {
  const { user } = useAuth();
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  useEffect(() => {
    fetchFactors();
  }, [showCustomOnly]);

  const fetchFactors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('emission_factors')
        .select('*')
        .order('name');

      if (showCustomOnly) {
        query = query.eq('is_custom', true).eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFactors(data || []);
    } catch (error: any) {
      toast.error('Failed to load emission factors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomFactor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emission_factors')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Custom factor deleted');
      fetchFactors();
    } catch (error: any) {
      toast.error('Failed to delete factor');
      console.error(error);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(factors.map(f => f.category));
    return Array.from(cats).sort();
  }, [factors]);

  const regions = useMemo(() => {
    const regs = new Set(factors.map(f => f.region).filter(Boolean));
    return Array.from(regs).sort();
  }, [factors]);

  const filteredFactors = useMemo(() => {
    return factors.filter(factor => {
      const matchesSearch = 
        factor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factor.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesScope = scopeFilter === 'all' || factor.scope === scopeFilter;
      const matchesCategory = categoryFilter === 'all' || factor.category === categoryFilter;
      const matchesRegion = regionFilter === 'all' || factor.region === regionFilter;

      return matchesSearch && matchesScope && matchesCategory && matchesRegion;
    });
  }, [factors, searchTerm, scopeFilter, categoryFilter, regionFilter]);

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Scope', 'Factor Value', 'Unit', 'Region', 'Version', 'Source', 'Year'];
    const rows = filteredFactors.map(f => [
      f.name,
      f.category,
      f.scope,
      f.factor_value,
      f.unit,
      f.region || '',
      f.version || '1.0',
      f.source,
      f.year || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emission-factors.csv';
    a.click();
    toast.success('Exported to CSV');
  };

  const getScopeBadgeVariant = (scope: string) => {
    switch (scope) {
      case 'S1': return 'default';
      case 'S2': return 'secondary';
      case 'S3': return 'outline';
      default: return 'default';
    }
  };

  return (
    <>
      <FactorUpdateNotifications />
      
      <Card>
        <CardHeader>
          <CardTitle>Emission Factors Database</CardTitle>
          <CardDescription>
            {showCustomOnly ? 'Your custom emission factors' : 'All standard and custom emission factors'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search factors by name, category, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="S1">Scope 1</SelectItem>
              <SelectItem value="S2">Scope 2</SelectItem>
              <SelectItem value="S3">Scope 3</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant={showCustomOnly ? 'default' : 'outline'} 
            onClick={() => setShowCustomOnly(!showCustomOnly)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showCustomOnly ? 'Show All' : 'Custom Only'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredFactors.length} of {factors.length} factors
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Factor Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Year</TableHead>
                  {showCustomOnly && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={showCustomOnly ? 10 : 9} className="text-center py-8">
                      Loading emission factors...
                    </TableCell>
                  </TableRow>
                ) : filteredFactors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showCustomOnly ? 10 : 9} className="text-center py-8 text-muted-foreground">
                      No emission factors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFactors.map((factor) => (
                    <TableRow key={factor.id}>
                      <TableCell className="font-medium">
                        {factor.name}
                        {factor.is_custom && (
                          <Badge variant="secondary" className="ml-2">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell>{factor.category}</TableCell>
                      <TableCell>
                        <Badge variant={getScopeBadgeVariant(factor.scope)}>
                          {factor.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>{Number(factor.factor_value).toFixed(6)}</TableCell>
                      <TableCell className="text-sm">{factor.unit}</TableCell>
                      <TableCell>{factor.region || '-'}</TableCell>
                      <TableCell>
                        <FactorVersionBadge
                          version={factor.version || '1.0'}
                          isLatest={factor.is_latest ?? true}
                          publishedDate={factor.published_date}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{factor.source}</TableCell>
                      <TableCell>{factor.year || '-'}</TableCell>
                      {showCustomOnly && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomFactor(factor.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
