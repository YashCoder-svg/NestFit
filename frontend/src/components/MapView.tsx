import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RankedNeighborhood, CityId } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Building2,
  Focus,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';

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
  const [legendOpen, setLegendOpen] = useState(true);

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

      // Esri Canvas tiles (deep dark gray #0B1120 feel)
      const tileUrl =
        theme === 'dark'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      }).addTo(map);

      tileLayerRef.current = tileLayer;
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
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 12, animate: true, duration: 1.0 });
    } else if (workplace && workplace.lat && workplace.lon) {
      map.flyTo([workplace.lat, workplace.lon], 11, { duration: 1.0 });
    } else {
      const targetCenter: [number, number] = city === 'pune' ? [18.5204, 73.8567] : [12.9716, 77.5946];
      map.flyTo(targetCenter, 11, { duration: 1.0 });
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
          <div class="w-7 h-7 rounded-lg bg-[#0F172A] border border-[#334155] shadow-lg flex items-center justify-center text-white text-[12px] font-medium">
            🏢
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([workplace.lat, workplace.lon], { icon: workplaceIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; color: ${theme === 'dark' ? '#E2E8F0' : '#0F172A'}; padding: 4px;">
        <span style="color: #94A3B8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Target Workplace</span><br/>
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
    Object.values(polygonLayersRef.current).forEach((layer) => map.removeLayer(layer));
    polygonLayersRef.current = {};

    neighborhoods.forEach((n) => {
      if (!n.polygon || n.polygon.length === 0) return;

      const latLngs = n.polygon.map((coord) => [coord[1], coord[0]] as [number, number]);

      const isRank1 = n.rank === 1 && !n.exclusionReasons?.length;
      const isRank2 = n.rank === 2 && !n.exclusionReasons?.length;
      const isExcluded = (n.exclusionReasons?.length ?? 0) > 0;
      const isGrid = n.isGridFallback || n.boundarySource === 'voronoi_grid';

      // Professional desaturated palette
      let color = '#6B5B95'; // Front 3+
      let fillColor = '#6B5B95';
      let fillOpacity = 0.16;
      let weight = 1.5;

      if (isRank1) {
        color = '#0D9488'; // Front 1: Muted Teal
        fillColor = '#0D9488';
        fillOpacity = 0.20;
        weight = 1.5;
      } else if (isRank2) {
        color = '#475569'; // Front 2: Slate Blue-Gray
        fillColor = '#475569';
        fillOpacity = 0.18;
        weight = 1.5;
      } else if (isExcluded) {
        color = '#334155'; // Excluded: Dark Gray
        fillColor = '#334155';
        fillOpacity = 0.12;
        weight = 1.0;
      }

      // Clean solid 1.5px borders - NO dashed lines for Voronoi
      const polygon = L.polygon(latLngs, {
        color,
        fillColor,
        fillOpacity,
        weight
      }).addTo(map);

      // Tooltip HTML with clean fintech card styling
      const tooltipContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <strong style="color: ${theme === 'dark' ? '#E2E8F0' : '#0F172A'}; font-size: 12.5px;">${n.name}</strong>
            <span style="font-size: 10px; font-weight: 600; color: ${isRank1 ? '#0D9488' : isExcluded ? '#64748B' : '#94A3B8'};">
              ${isRank1 ? 'Front 1' : isExcluded ? 'Excluded' : `Front ${n.rank}`}
            </span>
          </div>
          ${
            isGrid
              ? `
            <div style="display: inline-block; font-size: 9.5px; font-weight: 500; color: #94A3B8; margin-top: 2px;">
              <span>Modeled Area</span>
            </div>
          `
              : ''
          }
          <div style="margin-top: 4px; color: ${theme === 'dark' ? '#94A3B8' : '#475569'}; font-size: 11px;">
            <div>Rent: <b style="color: ${theme === 'dark' ? '#E2E8F0' : '#0F172A'}">${n.rent !== null ? `₹${n.rent.toLocaleString('en-IN')}/mo` : 'Unsurveyed'}</b></div>
            <div>Commute: <b style="color: ${theme === 'dark' ? '#E2E8F0' : '#0F172A'}">${Math.round(n.commuteMinutes)} mins</b> (${n.commuteDistanceKm} km)</div>
            <div>AQI: <b style="color: ${theme === 'dark' ? '#E2E8F0' : '#0F172A'}">${Math.round(n.aqi)}</b> • Hospitals: <b>${n.hospitalCount}</b></div>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        opacity: 0.98,
        pane: 'highestTooltipPane',
        offset: L.point(14, -14),
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
    layer.setStyle({ weight: 2.5, fillOpacity: 0.35 });

    return () => {
      if (polygonLayersRef.current[targetKey]) {
        polygonLayersRef.current[targetKey].setStyle({ weight: 1.5, fillOpacity: 0.18 });
      }
    };
  }, [hoveredArea, selectedArea]);

  // Map Controls
  const handleRecenterWorkplace = () => {
    const map = mapInstanceRef.current;
    if (map && workplace) {
      map.flyTo([workplace.lat, workplace.lon], 13, { duration: 0.8 });
    }
  };

  const handleFitFrontier = () => {
    const map = mapInstanceRef.current;
    if (map && neighborhoods && neighborhoods.length > 0) {
      const frontierOnly = neighborhoods.filter((n) => n.rank === 1);
      const targetList = frontierOnly.length > 0 ? frontierOnly : neighborhoods;
      const bounds = L.latLngBounds(targetList.map((n) => [n.centroid.lat, n.centroid.lon]));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13, animate: true, duration: 0.8 });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-[#1F2937] shadow-card bg-[#0B1120]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Target Destination Badge in Top-Right */}
      <div className="absolute top-3.5 right-3.5 z-[400] bg-[#141B2D] px-3 py-1.5 rounded-lg border border-[#1F2937] text-xs shadow-card hidden sm:flex items-center gap-2">
        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
        <span className="text-[#94A3B8]">Campus:</span>
        <strong className="text-[#E2E8F0] font-medium truncate max-w-[170px]">{workplace.name}</strong>
      </div>

      {/* Redesigned Compact Legend Card matching Surface Style in Top-Left */}
      <div className="absolute top-3.5 left-3.5 z-[400] bg-[#141B2D] rounded-lg border border-[#1F2937] shadow-card overflow-hidden text-xs max-w-[210px]">
        <button
          type="button"
          onClick={() => setLegendOpen(!legendOpen)}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-[#1A2332] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#94A3B8]" />
            <span className="font-semibold text-[#E2E8F0] text-[11px] uppercase tracking-wider">Classification</span>
          </div>
          {legendOpen ? <ChevronUp className="w-3 h-3 text-[#64748B]" /> : <ChevronDown className="w-3 h-3 text-[#64748B]" />}
        </button>

        {legendOpen && (
          <div className="px-3 pb-2.5 pt-1 space-y-1.5 border-t border-[#1F2937] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
              <span className="text-[#E2E8F0] font-medium">Front 1 (Optimal)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#475569]" />
              <span className="text-[#94A3B8]">Front 2 (Balanced)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B5B95]" />
              <span className="text-[#94A3B8]">Front 3+ (Dominated)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
              <span className="text-[#64748B]">Excluded</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Quiet Map Control Buttons in Bottom-Right */}
      <div className="absolute bottom-3.5 right-3.5 z-[400] flex flex-col gap-1">
        <button
          type="button"
          onClick={handleRecenterWorkplace}
          className="p-2 rounded-lg bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] shadow-card transition-colors"
          title="Recenter on Workplace"
        >
          <Building2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleFitFrontier}
          className="p-2 rounded-lg bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] shadow-card transition-colors"
          title="Fit All Front 1 Polygons"
        >
          <Focus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] shadow-card transition-colors"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] shadow-card transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
