import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CountryCoordsMap, CountryTotals } from '@/types/emissions';
import type { Facility } from '@/utils/facilityData';
import { facilityTypes } from '@/utils/facilityData';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Layers, MapPin, Zap } from 'lucide-react';

interface EnhancedGlobeMapProps {
  token?: string;
  countryTotals: CountryTotals;
  coords: CountryCoordsMap;
  facilities: Facility[];
  height?: number;
  visualMode: 'markers' | 'heatmap' | 'choropleth' | 'facilities';
  onVisualizationChange: (mode: 'markers' | 'heatmap' | 'choropleth' | 'facilities') => void;
  selectedFacility?: string;
  onFacilitySelect: (facilityId: string | null) => void;
}

function scopeColorClass(values: { s1: number; s2: number; s3: number }) {
  const { s1, s2, s3 } = values;
  const max = Math.max(s1, s2, s3);
  if (max === s1) return 'bg-primary';
  if (max === s2) return 'bg-secondary';
  return 'bg-accent';
}

export const EnhancedGlobeMap: React.FC<EnhancedGlobeMapProps> = ({ 
  token, 
  countryTotals, 
  coords, 
  facilities,
  height = 520,
  visualMode,
  onVisualizationChange,
  selectedFacility,
  onFacilitySelect
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dataArr = useMemo(() => Object.entries(countryTotals).map(([code, v]) => ({ code, ...v, ...coords[code] })), [countryTotals, coords]);
  const maxVal = useMemo(() => Math.max(1, ...dataArr.map((d) => d.total)), [dataArr]);

  const facilityData = useMemo(() => {
    return facilities.map(facility => ({
      ...facility,
      emissions: Math.random() * 1000 + 100, // Mock emissions for now
    }));
  }, [facilities]);

  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;

    let canceled = false;
    setIsLoading(true);

    (async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default as any;
        if (canceled) return;
        
        mapboxgl.accessToken = token;

        if (!mapRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: containerRef.current,
            style: visualMode === 'choropleth' ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/dark-v11',
            center: [10, 15],
            zoom: 1.8,
            projection: 'globe',
            pitch: 30,
          });

          mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
          mapRef.current.scrollZoom.setWheelZoomRate(1/200);

          // Add atmosphere for globe projection
          mapRef.current.on('style.load', () => {
            mapRef.current?.setFog({
              color: 'rgb(220, 220, 220)',
              'high-color': 'rgb(200, 200, 225)',
              'horizon-blend': 0.1,
            });
          });
        }

        // Clear previous markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        if (visualMode === 'markers') {
          renderMarkers(mapboxgl);
        } else if (visualMode === 'facilities') {
          renderFacilities(mapboxgl);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Map loading error:', error);
        setIsLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [token, dataArr, maxVal, visualMode, facilityData]);

  const renderMarkers = (mapboxgl: any) => {
    dataArr.forEach(d => {
      if (!d || !Number.isFinite(d.lng) || !Number.isFinite(d.lat)) return;
      
      const bar = document.createElement('div');
      const minH = 15;
      const maxH = 80;
      const h = Math.max(minH, Math.sqrt(d.total / maxVal) * maxH);
      const colorCls = scopeColorClass({ s1: d.s1, s2: d.s2, s3: d.s3 });
      
      bar.className = `relative w-3 rounded-t-sm ${colorCls} shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer`;
      bar.style.height = `${h}px`;

      // Add glow effect
      const glow = document.createElement('div');
      glow.className = 'absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-lg animate-pulse';
      bar.appendChild(glow);

      const marker = new mapboxgl.Marker({ element: bar }).setLngLat([d.lng, d.lat]);

      // Enhanced popup with glassmorphism
      const popupContent = `
        <div class="map-tooltip min-w-[280px]">
          <div class="font-semibold text-lg mb-2 text-foreground">${d.name || d.country}</div>
          <div class="text-sm text-muted-foreground mb-3">Total Emissions: <span class="font-bold text-foreground">${d.total.toFixed(1)} tCO2e</span></div>
          <div class="grid grid-cols-3 gap-3 mb-3">
            <div class="text-center p-2 bg-primary/10 rounded-lg">
              <div class="text-xs text-primary font-medium">Scope 1</div>
              <div class="font-semibold">${d.s1.toFixed(1)}</div>
            </div>
            <div class="text-center p-2 bg-secondary/10 rounded-lg">
              <div class="text-xs text-secondary font-medium">Scope 2</div>
              <div class="font-semibold">${d.s2.toFixed(1)}</div>
            </div>
            <div class="text-center p-2 bg-accent/10 rounded-lg">
              <div class="text-xs text-accent font-medium">Scope 3</div>
              <div class="font-semibold">${d.s3.toFixed(1)}</div>
            </div>
          </div>
          <div class="text-xs text-muted-foreground">Click to view facilities in this country</div>
        </div>
      `;
      
      marker.setPopup(new mapboxgl.Popup({ 
        closeButton: false, 
        className: 'map-popup',
        offset: [0, -h/2]
      }).setHTML(popupContent));

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  };

  const renderFacilities = (mapboxgl: any) => {
    facilityData.forEach(facility => {
      const facilityType = facilityTypes[facility.type];
      
      const element = document.createElement('div');
      element.innerHTML = facilityType.icon;
      element.className = `
        text-2xl p-2 rounded-full cursor-pointer transition-all duration-300 
        hover:scale-125 hover:shadow-xl
        ${selectedFacility === facility.id ? 'ring-4 ring-primary shadow-xl scale-110' : ''}
      `;
      element.style.backgroundColor = facilityType.color + '20';
      element.style.border = `2px solid ${facilityType.color}`;

      element.addEventListener('click', () => {
        onFacilitySelect(facility.id);
      });

      const marker = new mapboxgl.Marker({ element }).setLngLat([facility.lng, facility.lat]);

      const popupContent = `
        <div class="map-tooltip min-w-[320px]">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-2xl">${facilityType.icon}</span>
            <div>
              <div class="font-semibold text-lg">${facility.name}</div>
              <div class="text-sm text-muted-foreground">${facility.city}, ${coords[facility.country]?.name}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="p-2 bg-muted/20 rounded-lg">
              <div class="text-xs text-muted-foreground">Type</div>
              <div class="font-medium capitalize">${facility.type.replace('_', ' ')}</div>
            </div>
            <div class="p-2 bg-muted/20 rounded-lg">
              <div class="text-xs text-muted-foreground">Industry</div>
              <div class="font-medium capitalize">${facility.industry}</div>
            </div>
            <div class="p-2 bg-muted/20 rounded-lg">
              <div class="text-xs text-muted-foreground">Employees</div>
              <div class="font-medium">${facility.employees.toLocaleString()}</div>
            </div>
            <div class="p-2 bg-muted/20 rounded-lg">
              <div class="text-xs text-muted-foreground">Area</div>
              <div class="font-medium">${facility.area_sqm.toLocaleString()} m²</div>
            </div>
          </div>
          <div class="p-2 bg-destructive/10 rounded-lg">
            <div class="text-xs text-destructive font-medium">Est. Monthly Emissions</div>
            <div class="font-semibold">${facility.emissions.toFixed(1)} tCO2e</div>
          </div>
        </div>
      `;

      marker.setPopup(new mapboxgl.Popup({ 
        closeButton: true, 
        className: 'map-popup',
        offset: [0, -20]
      }).setHTML(popupContent));

      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const visualModes = [
    { key: 'markers', label: 'Country Markers', icon: MapPin },
    { key: 'facilities', label: 'Facilities', icon: BarChart3 },
    { key: 'heatmap', label: 'Heat Map', icon: Zap },
    { key: 'choropleth', label: 'Choropleth', icon: Layers },
  ];

  if (!token) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center min-h-[400px] text-center">
          <div>
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Map Visualization Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              Provide a Mapbox public token to render the interactive map.
            </p>
            <p className="text-sm text-muted-foreground">
              Get your free token at <a href="https://mapbox.com" target="_blank" rel="noopener" className="text-primary underline">mapbox.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Visualization Mode Controls */}
      <div className="absolute top-4 left-4 z-10 floating-panel">
        <div className="flex gap-2 flex-wrap">
          {visualModes.map(mode => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.key}
                size="sm"
                variant={visualMode === mode.key ? 'default' : 'outline'}
                onClick={() => onVisualizationChange(mode.key as any)}
                className="text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {mode.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 glass-overlay rounded-lg flex items-center justify-center">
          <div className="floating-panel text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-sm text-muted-foreground">Loading map visualization...</div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {visualMode === 'facilities' && (
        <div className="absolute top-4 right-4 z-10 floating-panel max-w-xs">
          <div className="text-sm">
            <div className="font-semibold mb-2">Facility View</div>
            <div className="text-muted-foreground mb-2">
              Showing {facilityData.length} facilities across {Object.keys(coords).length} countries.
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(facilityTypes).map(([type, config]) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {config.icon} {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div 
        ref={containerRef} 
        className="w-full rounded-lg overflow-hidden shadow-xl border border-border/50" 
        style={{ height }} 
        aria-label="Enhanced world emissions map" 
      />
    </div>
  );
};