import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Building2, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Mail,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supplierService } from '@/services/supplierService';

interface SupplierScorecardProps {
  supplierId: string;
  onBack: () => void;
}

const cdpGradeColors: Record<string, string> = {
  'A': 'bg-green-500',
  'A-': 'bg-green-400',
  'B': 'bg-blue-500',
  'B-': 'bg-blue-400',
  'C': 'bg-amber-500',
  'C-': 'bg-amber-400',
  'D': 'bg-orange-500',
  'D-': 'bg-orange-400',
  'F': 'bg-red-500',
};

export function SupplierScorecard({ supplierId, onBack }: SupplierScorecardProps) {
  const { data: scorecard, isLoading } = useQuery({
    queryKey: ['supplier-scorecard', supplierId],
    queryFn: () => supplierService.getSupplierScorecard(supplierId),
  });

  const { data: engagements = [] } = useQuery({
    queryKey: ['supplier-engagements', supplierId],
    queryFn: () => supplierService.getSupplierEngagements(supplierId),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn: () => supplierService.getSupplierProducts(supplierId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Supplier not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  const { supplier, emissions, score, cdpGrade, trend, recommendations } = scorecard;

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-green-500' : trend === 'declining' ? 'text-red-500' : 'text-amber-500';

  const formatNumber = (num?: number) => {
    if (!num) return '-';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Suppliers
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {supplier.name}
          </h1>
          <p className="text-muted-foreground">
            {supplier.industry || 'No industry'} • {supplier.city ? `${supplier.city}, ` : ''}{supplier.country_code || 'Unknown location'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Request Data
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Engage Supplier
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold">{score.overall}</p>
              </div>
              <div className="relative">
                <Progress value={score.overall} className="w-16 h-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CDP Grade</p>
                <p className="text-3xl font-bold">{cdpGrade}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${cdpGradeColors[cdpGrade] || 'bg-slate-500'} flex items-center justify-center text-white font-bold`}>
                {cdpGrade}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emissions Trend</p>
                <p className="text-lg font-medium capitalize">{trend}</p>
              </div>
              <TrendIcon className={`h-8 w-8 ${trendColor}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Science-Based Target</p>
                <p className="text-lg font-medium">
                  {supplier.has_science_based_target ? 'Committed' : 'Not Set'}
                </p>
              </div>
              <Target className={`h-8 w-8 ${supplier.has_science_based_target ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Data Quality</span>
                  <span className="text-sm font-medium">{score.dataQuality}/100</span>
                </div>
                <Progress value={score.dataQuality} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Engagement</span>
                  <span className="text-sm font-medium">{score.engagement}/100</span>
                </div>
                <Progress value={score.engagement} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Performance</span>
                  <span className="text-sm font-medium">{score.performance}/100</span>
                </div>
                <Progress value={score.performance} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-primary" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Supplier Details */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tier</p>
                  <p className="font-medium capitalize">{supplier.tier.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Status</p>
                  <Badge variant="outline" className="capitalize">{supplier.engagement_status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Spend</p>
                  <p className="font-medium">
                    {supplier.annual_spend 
                      ? `${supplier.spend_currency || 'USD'} ${formatNumber(supplier.annual_spend)}`
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spend Category</p>
                  <p className="font-medium">{supplier.spend_category || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{supplier.contact_name || '-'}</p>
                  <p className="text-sm text-muted-foreground">{supplier.contact_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Data Submission</p>
                  <p className="font-medium">
                    {supplier.last_data_submission 
                      ? new Date(supplier.last_data_submission).toLocaleDateString()
                      : 'No data submitted'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissions" className="space-y-4">
          {emissions ? (
            <Card>
              <CardHeader>
                <CardTitle>Emissions Data ({emissions.reporting_year})</CardTitle>
                <CardDescription>
                  Verification: <Badge variant="outline" className="capitalize">{emissions.verification_status}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scope 1</p>
                    <p className="text-2xl font-bold">{formatNumber(emissions.scope1_emissions)}</p>
                    <p className="text-xs text-muted-foreground">tCO2e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scope 2</p>
                    <p className="text-2xl font-bold">{formatNumber(emissions.scope2_emissions)}</p>
                    <p className="text-xs text-muted-foreground">tCO2e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Scope 3</p>
                    <p className="text-2xl font-bold">{formatNumber(emissions.scope3_emissions)}</p>
                    <p className="text-xs text-muted-foreground">tCO2e</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated to You</p>
                    <p className="text-2xl font-bold text-primary">{formatNumber(emissions.allocated_emissions)}</p>
                    <p className="text-xs text-muted-foreground">tCO2e</p>
                  </div>
                </div>

                {emissions.emission_intensity && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Emission Intensity</p>
                    <p className="text-lg font-medium">
                      {formatNumber(emissions.emission_intensity)} {emissions.intensity_unit || 'tCO2e/M revenue'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No emissions data available</p>
                <Button className="mt-4">Request Emissions Data</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement History</CardTitle>
            </CardHeader>
            <CardContent>
              {engagements.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No engagements yet</p>
                  <Button className="mt-4">Start Engagement</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {engagements.map((engagement) => (
                    <div key={engagement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{engagement.title}</p>
                          <Badge variant="outline" className="capitalize">{engagement.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{engagement.engagement_type.replace('_', ' ')}</p>
                        {engagement.description && (
                          <p className="text-sm mt-1">{engagement.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {engagement.sent_date 
                            ? `Sent: ${new Date(engagement.sent_date).toLocaleDateString()}`
                            : 'Not yet sent'
                          }
                          {engagement.due_date && ` • Due: ${new Date(engagement.due_date).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No products tracked yet</p>
                  <Button className="mt-4">Add Products</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <BarChart3 className="h-5 w-5 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{product.product_name}</p>
                          {product.scope3_category && (
                            <Badge variant="outline">Category {product.scope3_category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category || 'Uncategorized'}</p>
                        {product.emission_factor && (
                          <p className="text-sm mt-1">
                            EF: {product.emission_factor} {product.emission_factor_unit}
                          </p>
                        )}
                        {product.total_emissions && (
                          <p className="text-sm font-medium mt-1">
                            Total: {formatNumber(product.total_emissions)} kgCO2e
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
