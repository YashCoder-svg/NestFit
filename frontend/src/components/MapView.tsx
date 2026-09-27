import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RankedNeighborhood, CityId } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MapViewProps {
  city: CityId;
  workplace: { name: string; lat: number; lon: number };
  neighborhoods: RankedNeighborhood[];
  selectedArea: RankedNeighborhood | null;
  hoveredArea: RankedNeighborhood | null;
  onSelectArea: (area: RankedNeighborhood) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  city,
  workplace,
  neighborhoods,
  selectedArea,
  hoveredArea,
  onSelectArea
}) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const workplaceMarkerRef = useRef<L.Marker | null>(null);
  const polygonLayersRef = useRef<{ [key: string]: L.Polygon }>({});

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = city === 'pune' ? [18.5204, 73.8567] : [12.9716, 77.5946];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      if (!map.getPane('highestTooltipPane')) {
        const tooltipPane = map.createPane('highestTooltipPane');
        tooltipPane.style.zIndex = '9999';
        tooltipPane.style.pointerEvents = 'none';
      }

      // Free, no-key dark and light tile providers with zero watermarks (Esri World Dark/Light Gray Canvas)
      const tileUrl =
        theme === 'dark'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map instance stays mounted across re-renders
    };
  }, []);

  // 2. Dynamically Switch Tiles when Dark / Light Mode toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const newUrl =
      theme === 'dark'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(newUrl);
    }
  }, [theme]);

  // 3. Pan / Fly Map when City Changes or Neighborhoods load
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (neighborhoods && neighborhoods.length > 0) {
      const bounds = L.latLngBounds(neighborhoods.map((n) => [n.centroid.lat, n.centroid.lon]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true, duration: 1.2 });
    } else if (workplace && workplace.lat && workplace.lon) {
      map.flyTo([workplace.lat, workplace.lon], 11, { duration: 1.2 });
    } else {
      const targetCenter: [number, number] = city === 'pune' ? [18.5204, 73.8567] : [12.9716, 77.5946];
      map.flyTo(targetCenter, 11, { duration: 1.2 });
    }
  }, [city, neighborhoods, workplace]);


  // 4. Update Workplace Destination Pin Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (workplaceMarkerRef.current) {
      map.removeLayer(workplaceMarkerRef.current);
    }

    const workplaceIcon = L.divIcon({
      className: 'custom-wp-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-8 h-8 rounded-full bg-rose-500/35 animate-ping"></span>
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 border-2 border-white shadow-2xl flex items-center justify-center text-white text-[13px] font-bold">
            🏢
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([workplace.lat, workplace.lon], { icon: workplaceIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; color: ${theme === 'dark' ? '#f8fafc' : '#0f172a'}; padding: 4px;">
        <span style="color: #f43f5e; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Target Workplace</span><br/>
        <strong style="font-size: 13px;">${workplace.name}</strong>
      </div>
    `);

    workplaceMarkerRef.current = marker;
  }, [workplace, theme]);

  // 5. Update Neighborhood Boundary Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous polygon layers
    Object.values(polygonLayersRef.current).forEach(layer => map.removeLayer(layer));
    polygonLayersRef.current = {};

    neighborhoods.forEach((n) => {
      if (!n.polygon || n.polygon.length === 0) return;

      const latLngs = n.polygon.map(coord => [coord[1], coord[0]] as [number, number]);

      const isRank1 = n.rank === 1 && !n.exclusionReasons?.length;
      const isRank2 = n.rank === 2 && !n.exclusionReasons?.length;
      const isExcluded = (n.exclusionReasons?.length ?? 0) > 0;
      const isGrid = n.isGridFallback || n.boundarySource === 'voronoi_grid';

      let color = '#8b5cf6'; // Front 3+
      let fillColor = '#8b5cf6';
      let fillOpacity = isGrid ? 0.18 : 0.32;
      let weight = isGrid ? 1.8 : 1.5;

      if (isRank1) {
        color = '#10b981';
        fillColor = '#10b981';
        fillOpacity = isGrid ? 0.28 : 0.48;
        weight = 2.5;
      } else if (isRank2) {
        color = '#06b6d4';
        fillColor = '#06b6d4';
        fillOpacity = isGrid ? 0.22 : 0.38;
        weight = 2.0;
      } else if (isExcluded) {
        color = '#64748b';
        fillColor = '#475569';
        fillOpacity = 0.12;
        weight = 1.0;
      }

      const polygon = L.polygon(latLngs, {
        color,
        fillColor,
        fillOpacity,
        weight,
        dashArray: isExcluded ? '3, 4' : isGrid ? '5, 4' : undefined
      }).addTo(map);

      // Tooltip HTML with z-index stacking fix and Voronoi provenance badge
      const tooltipContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <strong style="color: ${theme === 'dark' ? '#f8fafc' : '#0f172a'}; font-size: 13px;">${n.name}</strong>
            <span style="font-size: 10px; font-weight: 800; color: ${isRank1 ? '#10b981' : isExcluded ? '#94a3b8' : '#06b6d4'};">
              ${isRank1 ? '★ Front 1' : isExcluded ? 'Filtered' : `Front ${n.rank}`}
            </span>
          </div>
          ${isGrid ? `
            <div style="display: inline-flex; align-items: center; gap: 4px; font-size: 9.5px; font-weight: 600; color: #f59e0b; margin-top: 2px;">
              <span>📐</span>
              <span>Spatial Voronoi Grid (Regional Sector)</span>
            </div>
          ` : ''}
          <div style="margin-top: 4px; color: ${theme === 'dark' ? '#cbd5e1' : '#475569'}; font-size: 11px;">
            <div>Rent: <b>${n.rent !== null ? `₹${n.rent.toLocaleString('en-IN')}/mo` : 'Not available'}</b></div>
            <div>Commute: <b>${Math.round(n.commuteMinutes)} mins</b> (${n.commuteDistanceKm} km)</div>
            <div>AQI: <b>${Math.round(n.aqi)}</b> • Hospitals: <b>${n.hospitalCount}</b></div>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        opacity: 0.98,
        pane: 'highestTooltipPane',
        offset: L.point(16, -16),
        direction: 'top',
        className: 'custom-leaflet-tooltip'
      });

      polygon.on('click', () => {
        onSelectArea(n);
        map.flyTo([n.centroid.lat, n.centroid.lon], 13, { duration: 0.8 });
      });

      polygonLayersRef.current[n.key] = polygon;
    });
  }, [neighborhoods, theme, onSelectArea]);

  // 6. Highlight hovered or selected areas
  useEffect(() => {
    const targetKey = hoveredArea?.key || selectedArea?.key;
    if (!targetKey || !polygonLayersRef.current[targetKey]) return;

    const layer = polygonLayersRef.current[targetKey];
    layer.setStyle({ weight: 4.5, stroke: true });

    return () => {
      if (polygonLayersRef.current[targetKey]) {
        polygonLayersRef.current[targetKey].setStyle({ weight: 2.5 });
      }
    };
  }, [hoveredArea, selectedArea]);

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Legend Key */}
      <div className="absolute top-4 left-4 z-[400] glass-panel px-3.5 py-2.5 rounded-2xl border border-slate-800 text-xs shadow-xl backdrop-blur-md space-y-1.5 pointer-events-none">
        <div className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] flex items-center justify-between gap-3">
          <span>Pareto Map Key</span>
          <span className="text-emerald-400 capitalize">{city}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-slate-200 font-bold">Front 1 (Pareto Optimal)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500" />
          <span className="text-slate-300 font-medium">Front 2 (Near-Optimal)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-slate-400">Front 3+ (Dominated)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-600 border border-dashed border-slate-400" />
          <span className="text-slate-500">Excluded (Filtered)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
          <span className="w-3.5 h-2 rounded border border-dashed border-amber-400 bg-amber-500/20" />
          <span className="text-amber-300 text-[10px] font-semibold">Dashed = Spatial Voronoi Grid</span>
        </div>
      </div>
    </div>
  );
};
