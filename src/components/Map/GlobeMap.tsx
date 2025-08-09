import React, { useEffect, useMemo, useRef } from 'react';
import type { CountryCoordsMap, CountryTotals } from '@/types/emissions';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GlobeMapProps {
  token?: string;
  countryTotals: CountryTotals;
  coords: CountryCoordsMap;
  height?: number;
}

// Utility to decide dominant scope color class using design tokens
function scopeColorClass(values: { s1: number; s2: number; s3: number }) {
  const { s1, s2, s3 } = values;
  const max = Math.max(s1, s2, s3);
  if (max === s1) return 'bg-primary';
  if (max === s2) return 'bg-secondary';
  return 'bg-accent';
}

export const GlobeMap: React.FC<GlobeMapProps> = ({ token, countryTotals, coords, height = 520 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const dataArr = useMemo(() => Object.entries(countryTotals).map(([code, v]) => ({ code, ...v, ...coords[code] })), [countryTotals, coords]);
  const maxVal = useMemo(() => Math.max(1, ...dataArr.map((d) => d.total)), [dataArr]);

  useEffect(() => {
    if (!token) return; // wait for token
    if (!containerRef.current) return;

    let canceled = false;

    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default as any;
      if (canceled) return;
      mapboxgl.accessToken = token;

      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [10, 15],
          zoom: 1.2,
          projection: 'mercator',
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
        mapRef.current.scrollZoom.disable();
      }

      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add markers
      for (const d of dataArr) {
        if (!d || !Number.isFinite(d.lng) || !Number.isFinite(d.lat)) continue;
        const bar = document.createElement('div');
        const minH = 12; // px
        const maxH = 72; // px
        const h = Math.max(minH, Math.sqrt(d.total / maxVal) * maxH);
        const colorCls = scopeColorClass({ s1: d.s1, s2: d.s2, s3: d.s3 });
        bar.className = `relative w-[10px] rounded-t-sm ${colorCls} shadow-lg`;
        bar.style.height = `${h}px`;

        const dot = document.createElement('div');
        dot.className = 'absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/90 shadow-md pulse';
        bar.appendChild(dot);

        const marker = new mapboxgl.Marker({ element: bar }).setLngLat([d.lng, d.lat]);

        const s1 = d.s1.toFixed(2);
        const s2 = d.s2.toFixed(2);
        const s3 = d.s3.toFixed(2);
        const tot = d.total.toFixed(2);
        const html = `<div class="text-sm">
          <div class="font-medium">${d.name || d.country}</div>
          <div class="mt-1">Total: <strong>${tot}</strong> tCO2e</div>
          <div class="mt-1 grid grid-cols-3 gap-2">
            <div>S1: ${s1}</div>
            <div>S2: ${s2}</div>
            <div>S3: ${s3}</div>
          </div>
        </div>`;
        marker.setPopup(new mapboxgl.Popup({ closeButton: false }).setHTML(html));
        marker.addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [token, dataArr, maxVal]);

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

  if (!token) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground" style={{ height }}>
        Provide a Mapbox public token to render the map.
      </div>
    );
  }

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden shadow" style={{ height }} aria-label="World emissions map" />;
};
