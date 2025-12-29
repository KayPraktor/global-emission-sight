import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Database, Globe, Info } from 'lucide-react';
import { eeioService } from '@/services/eeioService';
import type { EEIOFactor } from '@/types/eeio';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function EEIOFactorsTable() {
  const [factors, setFactors] = useState<EEIOFactor[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalFactors: 0, industries: 0, regions: 0, avgUncertainty: 0 });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [factorsData, industriesData, regionsData, statsData] = await Promise.all([
          eeioService.getAllFactors(),
          eeioService.getIndustries(),
          eeioService.getRegions(),
          eeioService.getFactorStats(),
        ]);
        setFactors(factorsData);
        setIndustries(industriesData);
        setRegions(regionsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredFactors = factors.filter(factor => {
    const matchesSearch = !searchTerm || 
      factor.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factor.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (factor.naics_code && factor.naics_code.includes(searchTerm));
    
    const matchesIndustry = selectedIndustry === 'all' || factor.industry === selectedIndustry;
    const matchesRegion = selectedRegion === 'all' || factor.region === selectedRegion;
    const matchesQuality = selectedQuality === 'all' || factor.data_quality_tier === selectedQuality;
    
    return matchesSearch && matchesIndustry && matchesRegion && matchesQuality;
  });

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'primary':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Primary</Badge>;
      case 'secondary':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Secondary</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Estimated</Badge>;
    }
  };

  const getRegionBadge = (region: string) => {
    const colors: Record<string, string> = {
      'Global': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'US': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'EU': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      'UK': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Asia-Pacific': 'bg-green-500/10 text-green-500 border-green-500/20',
    };
    return <Badge className={colors[region] || 'bg-muted'}>{region}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Factors</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalFactors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Industries</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.industries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Regions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.regions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Avg Uncertainty</span>
            </div>
            <p className="text-2xl font-bold mt-1">±{(stats.avgUncertainty * 100).toFixed(0)}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            EEIO Emission Factors Database
          </CardTitle>
          <CardDescription>
            Environmentally-Extended Input-Output factors for spend-based Scope 3 estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by industry, sector, or NAICS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((reg) => (
                  <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger>
                <SelectValue placeholder="All Quality Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality Tiers</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="estimated">Estimated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredFactors.length} of {factors.length} factors
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAICS</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Factor (kgCO₂e/USD)</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            Scope 3 <Info className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Applicable Scope 3 categories</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFactors.slice(0, 100).map((factor) => (
                  <TableRow key={factor.id}>
                    <TableCell className="font-mono text-sm">
                      {factor.naics_code || '-'}
                    </TableCell>
                    <TableCell className="font-medium">{factor.industry}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{factor.sector}</TableCell>
                    <TableCell className="text-right font-mono">
                      {factor.factor_value.toFixed(3)}
                      <span className="text-muted-foreground text-xs ml-1">
                        ±{(factor.uncertainty * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell>{getRegionBadge(factor.region)}</TableCell>
                    <TableCell>{getQualityBadge(factor.data_quality_tier)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {factor.source}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {factor.applicable_scope3_categories?.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            Cat {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredFactors.length > 100 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing first 100 results. Use filters to narrow down.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
