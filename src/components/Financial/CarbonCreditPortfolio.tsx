import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, TrendingUp, TrendingDown, Leaf, Trash2, Archive, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { carbonCreditService, CarbonCredit, CarbonCreditType, PortfolioSummary, AddCreditInput } from '@/services/carbonCreditService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CREDIT_TYPE_COLORS: Record<CarbonCreditType, string> = {
  VCU: 'hsl(142, 76%, 36%)',
  GCC: 'hsl(48, 96%, 53%)',
  CER: 'hsl(199, 89%, 48%)',
  EUA: 'hsl(262, 83%, 58%)',
  ACR: 'hsl(346, 77%, 49%)',
  CAR: 'hsl(25, 95%, 53%)',
  GS_VER: 'hsl(173, 80%, 40%)',
  OTHER: 'hsl(215, 14%, 34%)',
};

const CREDIT_TYPE_LABELS: Record<CarbonCreditType, string> = {
  VCU: 'Verified Carbon Units',
  GCC: 'Gold Standard Credits',
  CER: 'Certified Emission Reductions',
  EUA: 'EU Allowances',
  ACR: 'American Carbon Registry',
  CAR: 'Climate Action Reserve',
  GS_VER: 'Gold Standard VER',
  OTHER: 'Other Credits',
};

const MAX_QUANTITY = 1_000_000_000;
const MAX_PRICE = 1_000_000_000;

export function CarbonCreditPortfolio() {
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRetireDialogOpen, setIsRetireDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [retireQuantity, setRetireQuantity] = useState<number>(0);
  const [retirePurpose, setRetirePurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetiring, setIsRetiring] = useState(false);
  const [creditToDelete, setCreditToDelete] = useState<CarbonCredit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCredit, setNewCredit] = useState<AddCreditInput>({
    credit_type: 'VCU',
    vintage_year: new Date().getFullYear(),
    quantity: 0,
    purchase_price: 0,
    registry: '',
    project_name: '',
    project_type: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [creditsData, summaryData] = await Promise.all([
        carbonCreditService.getPortfolio(),
        carbonCreditService.getPortfolioSummary(),
      ]);
      setCredits(creditsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredit = async () => {
    if (isSubmitting) return;
    
    if (newCredit.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (newCredit.quantity > MAX_QUANTITY) {
      toast.error('Quantity exceeds maximum allowed value');
      return;
    }
    
    if (newCredit.purchase_price && newCredit.purchase_price > MAX_PRICE) {
      toast.error('Price exceeds maximum allowed value');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await carbonCreditService.addCredit(newCredit);
      if (result) {
        toast.success('Carbon credit added successfully');
        setIsAddDialogOpen(false);
        setNewCredit({
          credit_type: 'VCU',
          vintage_year: new Date().getFullYear(),
          quantity: 0,
          purchase_price: 0,
          registry: '',
          project_name: '',
          project_type: '',
        });
        loadData();
      } else {
        toast.error('Failed to add carbon credit');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetireCredits = async () => {
    if (isRetiring) return;
    
    if (!selectedCredit || retireQuantity <= 0 || !retirePurpose) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsRetiring(true);
    try {
      const success = await carbonCreditService.retireCredits(
        selectedCredit.id,
        retireQuantity,
        retirePurpose
      );

      if (success) {
        toast.success('Credits retired successfully');
        setIsRetireDialogOpen(false);
        setSelectedCredit(null);
        setRetireQuantity(0);
        setRetirePurpose('');
        loadData();
      } else {
        toast.error('Failed to retire credits');
      }
    } finally {
      setIsRetiring(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!creditToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const success = await carbonCreditService.deleteCredit(creditToDelete.id);
      if (success) {
        toast.success('Credit deleted');
        loadData();
      } else {
        toast.error('Failed to delete credit');
      }
    } finally {
      setIsDeleting(false);
      setCreditToDelete(null);
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const pieData = summary?.byType.map(t => ({
    name: CREDIT_TYPE_LABELS[t.type],
    value: t.quantity,
    color: CREDIT_TYPE_COLORS[t.type],
  })) || [];

  const vintageData = summary?.byVintage.map(v => ({
    year: v.year.toString(),
    quantity: v.quantity,
  })) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{formatNumber(summary?.totalCredits || 0)}</span>
              <span className="text-sm text-muted-foreground">tCO₂e</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalCost || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(summary?.unrealizedGainLoss || 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <span className={`text-2xl font-bold ${(summary?.unrealizedGainLoss || 0) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                {formatCurrency(summary?.unrealizedGainLoss || 0)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({(summary?.gainLossPercentage || 0).toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Credit Type</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value) + ' tCO₂e', 'Quantity']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No credits in portfolio
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits by Vintage Year</CardTitle>
          </CardHeader>
          <CardContent>
            {vintageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={vintageData}>
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Credits']} />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No credits in portfolio
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credits Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Carbon Credits</CardTitle>
            <CardDescription>Manage your carbon credit portfolio</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Credit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Carbon Credit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credit Type</Label>
                    <Select
                      value={newCredit.credit_type}
                      onValueChange={(v) => setNewCredit({ ...newCredit, credit_type: v as CarbonCreditType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CREDIT_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vintage Year</Label>
                    <Input
                      type="number"
                      value={newCredit.vintage_year}
                      onChange={(e) => setNewCredit({ ...newCredit, vintage_year: parseInt(e.target.value) || new Date().getFullYear() })}
                      min={1990}
                      max={new Date().getFullYear() + 5}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity (tCO₂e)</Label>
                    <Input
                      type="number"
                      value={newCredit.quantity || ''}
                      onChange={(e) => setNewCredit({ ...newCredit, quantity: Math.min(parseFloat(e.target.value) || 0, MAX_QUANTITY) })}
                      min={0}
                      max={MAX_QUANTITY}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase Price ($/tonne)</Label>
                    <Input
                      type="number"
                      value={newCredit.purchase_price || ''}
                      onChange={(e) => setNewCredit({ ...newCredit, purchase_price: Math.min(parseFloat(e.target.value) || 0, MAX_PRICE) })}
                      min={0}
                      max={MAX_PRICE}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={newCredit.project_name}
                    onChange={(e) => setNewCredit({ ...newCredit, project_name: e.target.value })}
                    placeholder="e.g., Amazon Rainforest Conservation"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Registry</Label>
                    <Input
                      value={newCredit.registry}
                      onChange={(e) => setNewCredit({ ...newCredit, registry: e.target.value })}
                      placeholder="e.g., Verra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Type</Label>
                    <Input
                      value={newCredit.project_type}
                      onChange={(e) => setNewCredit({ ...newCredit, project_type: e.target.value })}
                      placeholder="e.g., REDD+"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleAddCredit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Credit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="retired">Retired</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Vintage</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credits.filter(c => c.status === 'active').map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <Badge variant="secondary" style={{ backgroundColor: CREDIT_TYPE_COLORS[credit.credit_type] + '20', color: CREDIT_TYPE_COLORS[credit.credit_type] }}>
                          {credit.credit_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{credit.project_name || '-'}</TableCell>
                      <TableCell>{credit.vintage_year}</TableCell>
                      <TableCell className="text-right">{formatNumber(credit.quantity)}</TableCell>
                      <TableCell className="text-right">
                        {credit.purchase_price ? formatCurrency(credit.quantity * credit.purchase_price) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {credit.current_price ? formatCurrency(credit.quantity * credit.current_price) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCredit(credit);
                              setRetireQuantity(credit.quantity);
                              setIsRetireDialogOpen(true);
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCreditToDelete(credit)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {credits.filter(c => c.status === 'active').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No active credits. Add your first carbon credit to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="retired">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Vintage</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Retirement Date</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credits.filter(c => c.status === 'retired').map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <Badge variant="secondary">{credit.credit_type}</Badge>
                      </TableCell>
                      <TableCell>{credit.project_name || '-'}</TableCell>
                      <TableCell>{credit.vintage_year}</TableCell>
                      <TableCell className="text-right">{formatNumber(credit.quantity)}</TableCell>
                      <TableCell>{credit.retirement_date || '-'}</TableCell>
                      <TableCell>{credit.retirement_purpose || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {credits.filter(c => c.status === 'retired').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No retired credits yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Retire Dialog */}
      <Dialog open={isRetireDialogOpen} onOpenChange={setIsRetireDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Carbon Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantity to Retire</Label>
              <Input
                type="number"
                value={retireQuantity}
                onChange={(e) => setRetireQuantity(parseFloat(e.target.value) || 0)}
                max={selectedCredit?.quantity || 0}
              />
              <p className="text-sm text-muted-foreground">
                Available: {formatNumber(selectedCredit?.quantity || 0)} tCO₂e
              </p>
            </div>
            <div className="space-y-2">
              <Label>Retirement Purpose</Label>
              <Input
                value={retirePurpose}
                onChange={(e) => setRetirePurpose(e.target.value)}
                placeholder="e.g., Offset 2024 Scope 1 emissions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRetireDialogOpen(false)} disabled={isRetiring}>Cancel</Button>
            <Button onClick={handleRetireCredits} disabled={isRetiring}>
              {isRetiring && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Retire Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!creditToDelete} onOpenChange={(open) => !open && setCreditToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Carbon Credit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {creditToDelete?.credit_type} credit
              {creditToDelete?.project_name ? ` from "${creditToDelete.project_name}"` : ''}? 
              This will remove {formatNumber(creditToDelete?.quantity || 0)} tCO₂e from your portfolio. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
