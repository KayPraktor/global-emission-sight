import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  MoreHorizontal,
  Mail,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supplierService, Supplier } from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';
import { SupplierOnboarding } from './SupplierOnboarding';
import { SupplierScorecard } from './SupplierScorecard';

const tierColors: Record<string, string> = {
  'tier_1': 'bg-blue-500',
  'tier_2': 'bg-amber-500',
  'tier_3': 'bg-slate-500',
};

const statusColors: Record<string, string> = {
  'pending': 'bg-slate-500',
  'invited': 'bg-blue-500',
  'active': 'bg-green-500',
  'unresponsive': 'bg-amber-500',
  'declined': 'bg-red-500',
};

const dataQualityColors: Record<string, string> = {
  'primary': 'bg-green-500',
  'secondary': 'bg-blue-500',
  'estimated': 'bg-amber-500',
  'spend_based': 'bg-slate-500',
};

export function SupplierDashboard() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', organization?.id],
    queryFn: () => organization?.id ? supplierService.getSuppliers(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['supplier-stats', organization?.id],
    queryFn: () => organization?.id ? supplierService.getSupplierStats(organization.id) : Promise.resolve(null),
    enabled: !!organization?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (supplierId: string) => supplierService.deleteSupplier(supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier-stats'] });
      toast.success('Supplier deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete supplier');
    },
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.industry?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || supplier.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || supplier.engagement_status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const formatCurrency = (amount?: number, currency = 'USD') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (selectedSupplierId) {
    return (
      <SupplierScorecard 
        supplierId={selectedSupplierId} 
        onBack={() => setSelectedSupplierId(null)} 
      />
    );
  }

  if (showOnboarding) {
    return (
      <SupplierOnboarding 
        onComplete={() => {
          setShowOnboarding(false);
          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
          queryClient.invalidateQueries({ queryKey: ['supplier-stats'] });
        }}
        onCancel={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Engagements</p>
                <p className="text-2xl font-bold">{stats?.byStatus?.active || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">With SBT</p>
                <p className="text-2xl font-bold">{stats?.withSBT || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{stats?.averageScore || 0}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Distribution */}
      {stats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(stats.byDataQuality).map(([quality, count]) => (
                <div key={quality} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dataQualityColors[quality] || 'bg-slate-500'}`} />
                  <span className="text-sm capitalize">{quality.replace('_', ' ')}: {count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="tier_1">Tier 1</SelectItem>
              <SelectItem value="tier_2">Tier 2</SelectItem>
              <SelectItem value="tier_3">Tier 3</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unresponsive">Unresponsive</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowOnboarding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Quality</TableHead>
                <TableHead>Annual Spend</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>SBT</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No suppliers found. Add your first supplier to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow 
                    key={supplier.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedSupplierId(supplier.id)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {supplier.industry || 'No industry'} • {supplier.country_code || 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <div className={`w-2 h-2 rounded-full mr-2 ${tierColors[supplier.tier]}`} />
                        {supplier.tier.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <div className={`w-2 h-2 rounded-full mr-2 ${statusColors[supplier.engagement_status]}`} />
                        {supplier.engagement_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        <div className={`w-2 h-2 rounded-full mr-2 ${dataQualityColors[supplier.emissions_data_quality || 'estimated']}`} />
                        {(supplier.emissions_data_quality || 'estimated').replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(supplier.annual_spend, supplier.spend_currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={supplier.supplier_score || 0} className="w-16 h-2" />
                        <span className="text-sm">{supplier.supplier_score !== undefined ? String(supplier.supplier_score) : '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.has_science_based_target ? (
                        <Target className="h-4 w-4 text-green-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedSupplierId(supplier.id)}>
                            View Scorecard
                          </DropdownMenuItem>
                          <DropdownMenuItem>Request Data</DropdownMenuItem>
                          <DropdownMenuItem>Send Survey</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(supplier.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
