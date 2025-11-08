import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Facility } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, X } from 'lucide-react';

interface FacilitiesMapProps {
  facilities: Facility[];
  onViewEmissions?: (facility: Facility) => void;
}

export const FacilitiesMap: React.FC<FacilitiesMapProps> = ({ facilities, onViewEmissions }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // Check for Mapbox token in environment variables
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (token) {
      setMapboxToken(token);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current || !facilities.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each facility with valid coordinates
    const validFacilities = facilities.filter(f => f.latitude && f.longitude);
    
    validFacilities.forEach((facility) => {
      const el = document.createElement('div');
      el.className = 'facility-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          background: hsl(var(--primary));
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([Number(facility.longitude), Number(facility.latitude)])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedFacility(facility);
        map.current?.flyTo({
          center: [Number(facility.longitude), Number(facility.latitude)],
          zoom: 10,
          duration: 1500,
        });
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (validFacilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validFacilities.forEach(facility => {
        bounds.extend([Number(facility.longitude), Number(facility.latitude)]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [facilities]);

  if (!mapboxToken) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-semibold mb-2">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To display the interactive map, please add your Mapbox token to the environment variables.
            </p>
            <p className="text-xs text-muted-foreground">
              Add VITE_MAPBOX_TOKEN to your .env file or configure it in your backend settings.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-[600px] rounded-lg shadow-lg" />
      
      {selectedFacility && (
        <Card className="absolute top-4 left-4 w-80 p-4 shadow-xl z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{selectedFacility.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFacility(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>{' '}
              <Badge variant="outline" className="ml-1">
                {selectedFacility.facility_type}
              </Badge>
            </div>
            
            {selectedFacility.city && (
              <div>
                <span className="text-muted-foreground">City:</span>{' '}
                {selectedFacility.city}, {selectedFacility.country_code}
              </div>
            )}
            
            {selectedFacility.address && (
              <div>
                <span className="text-muted-foreground">Address:</span>{' '}
                {selectedFacility.address}
              </div>
            )}
            
            {selectedFacility.employees && (
              <div>
                <span className="text-muted-foreground">Employees:</span>{' '}
                {selectedFacility.employees.toLocaleString()}
              </div>
            )}
            
            {selectedFacility.area_sqm && (
              <div>
                <span className="text-muted-foreground">Area:</span>{' '}
                {Number(selectedFacility.area_sqm).toLocaleString()} m²
              </div>
            )}
          </div>
          
          {onViewEmissions && (
            <Button
              className="w-full mt-4"
              size="sm"
              onClick={() => onViewEmissions(selectedFacility)}
            >
              View Emissions Data
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
