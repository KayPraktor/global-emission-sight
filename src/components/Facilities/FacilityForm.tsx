import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Facility, FacilityType } from '@/types/database';

const facilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  facility_type: z.enum(['office', 'warehouse', 'factory', 'retail', 'datacenter', 'other'] as const),
  country_code: z.string().min(2, 'Country code is required').max(2),
  city: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  area_sqm: z.number().positive().optional().nullable(),
  employees: z.number().int().positive().optional().nullable(),
  annual_revenue: z.number().positive().optional().nullable(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

interface FacilityFormProps {
  facility?: Facility | null;
  onSubmit: (data: FacilityFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FacilityForm({ facility, onSubmit, onCancel, isSubmitting }: FacilityFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: facility ? {
      name: facility.name,
      facility_type: facility.facility_type,
      country_code: facility.country_code,
      city: facility.city || '',
      address: facility.address || '',
      industry: facility.industry || '',
      latitude: facility.latitude ? Number(facility.latitude) : null,
      longitude: facility.longitude ? Number(facility.longitude) : null,
      area_sqm: facility.area_sqm ? Number(facility.area_sqm) : null,
      employees: facility.employees || null,
      annual_revenue: facility.annual_revenue ? Number(facility.annual_revenue) : null,
    } : {
      country_code: 'US',
      facility_type: 'office',
    },
  });

  const facilityType = watch('facility_type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Facility Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g., Main Office"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="facility_type">Facility Type *</Label>
          <Select
            value={facilityType}
            onValueChange={(value) => setValue('facility_type', value as FacilityType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select facility type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="factory">Factory</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="datacenter">Data Center</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.facility_type && (
            <p className="text-sm text-destructive">{errors.facility_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            {...register('industry')}
            placeholder="e.g., Technology"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country_code">Country Code *</Label>
          <Input
            id="country_code"
            {...register('country_code')}
            placeholder="US"
            maxLength={2}
            className={errors.country_code ? 'border-destructive' : ''}
          />
          {errors.country_code && (
            <p className="text-sm text-destructive">{errors.country_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="e.g., San Francisco"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...register('address')}
            placeholder="Full address"
            rows={2}
          />
        </div>

        {/* Location Coordinates */}
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            {...register('latitude', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            placeholder="e.g., 37.7749"
          />
          {errors.latitude && (
            <p className="text-sm text-destructive">{errors.latitude.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            {...register('longitude', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            placeholder="e.g., -122.4194"
          />
          {errors.longitude && (
            <p className="text-sm text-destructive">{errors.longitude.message}</p>
          )}
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <Label htmlFor="area_sqm">Area (m²)</Label>
          <Input
            id="area_sqm"
            type="number"
            {...register('area_sqm', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            placeholder="e.g., 5000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employees">Number of Employees</Label>
          <Input
            id="employees"
            type="number"
            {...register('employees', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            placeholder="e.g., 50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="annual_revenue">Annual Revenue ($)</Label>
          <Input
            id="annual_revenue"
            type="number"
            {...register('annual_revenue', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            placeholder="e.g., 1000000"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {facility ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
}
