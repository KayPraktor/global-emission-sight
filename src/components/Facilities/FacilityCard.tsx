import React from 'react';
import { Building2, MapPin, Users, DollarSign, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Facility } from '@/types/database';

interface FacilityCardProps {
  facility: Facility;
  onEdit: (facility: Facility) => void;
  onDelete: (id: string) => void;
  onViewEmissions: (facility: Facility) => void;
  emissionsCount?: number;
}

export function FacilityCard({ 
  facility, 
  onEdit, 
  onDelete, 
  onViewEmissions,
  emissionsCount = 0 
}: FacilityCardProps) {
  const facilityTypeLabels: Record<string, string> = {
    office: 'Office',
    warehouse: 'Warehouse',
    factory: 'Factory',
    retail: 'Retail',
    datacenter: 'Data Center',
    other: 'Other',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{facility.name}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {facilityTypeLabels[facility.facility_type] || facility.facility_type}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(facility)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(facility.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location */}
        {(facility.city || facility.country_code) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {facility.city && `${facility.city}, `}
              {facility.country_code}
            </span>
          </div>
        )}

        {facility.address && (
          <p className="text-sm text-muted-foreground">{facility.address}</p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          {facility.employees && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="text-sm font-medium">{facility.employees.toLocaleString()}</p>
              </div>
            </div>
          )}

          {facility.area_sqm && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Area</p>
                <p className="text-sm font-medium">{Number(facility.area_sqm).toLocaleString()} m²</p>
              </div>
            </div>
          )}

          {facility.annual_revenue && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Annual Revenue</p>
                <p className="text-sm font-medium">
                  ${(Number(facility.annual_revenue) / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Emissions Entries</p>
              <p className="text-sm font-medium">{emissionsCount}</p>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        {facility.latitude && facility.longitude && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Coordinates: {Number(facility.latitude).toFixed(4)}, {Number(facility.longitude).toFixed(4)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewEmissions(facility)}
          >
            View Emissions ({emissionsCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
