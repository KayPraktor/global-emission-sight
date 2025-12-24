import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Building2, Mail, Globe, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supplierService } from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';

interface SupplierOnboardingProps {
  onComplete: () => void;
  onCancel: () => void;
}

const industries = [
  'Manufacturing',
  'Transportation & Logistics',
  'Energy & Utilities',
  'Professional Services',
  'Technology',
  'Healthcare',
  'Construction',
  'Retail & Wholesale',
  'Agriculture & Food',
  'Financial Services',
  'Other'
];

const spendCategories = [
  'Raw Materials',
  'Components & Parts',
  'Packaging',
  'Equipment & Machinery',
  'IT & Software',
  'Professional Services',
  'Logistics & Transportation',
  'Utilities',
  'Office Supplies',
  'Other'
];

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
];

export function SupplierOnboarding({ onComplete, onCancel }: SupplierOnboardingProps) {
  const { organization } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_name: '',
    industry: '',
    country_code: '',
    city: '',
    tier: 'tier_1' as const,
    annual_spend: '',
    spend_category: '',
    spend_currency: 'USD',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!organization?.id) throw new Error('No organization');
      return supplierService.createSupplier({
        ...formData,
        organization_id: organization.id,
        annual_spend: formData.annual_spend ? parseFloat(formData.annual_spend) : undefined,
        engagement_status: 'pending',
      });
    },
    onSuccess: () => {
      toast.success('Supplier added successfully');
      onComplete();
    },
    onError: (error) => {
      toast.error(`Failed to add supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Supplier name is required');
      return;
    }
    createMutation.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Suppliers
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add New Supplier
          </CardTitle>
          <CardDescription>
            Add a supplier to track their emissions and engage them in your decarbonization journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(ind => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country_code} onValueChange={(v) => updateField('country_code', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => updateField('contact_name', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => updateField('contact_email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Relationship Details */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Relationship Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tier">Supplier Tier</Label>
                  <Select value={formData.tier} onValueChange={(v) => updateField('tier', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier_1">Tier 1 - Direct suppliers</SelectItem>
                      <SelectItem value="tier_2">Tier 2 - Suppliers' suppliers</SelectItem>
                      <SelectItem value="tier_3">Tier 3 - Upstream suppliers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spend_category">Spend Category</Label>
                  <Select value={formData.spend_category} onValueChange={(v) => updateField('spend_category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {spendCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual_spend">Annual Spend</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={formData.spend_currency} 
                      onValueChange={(v) => updateField('spend_currency', v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="annual_spend"
                      type="number"
                      value={formData.annual_spend}
                      onChange={(e) => updateField('annual_spend', e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Add any additional notes about this supplier"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Supplier'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
