import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankedNeighborhood } from '../types';
import { FactorRadarChart } from './FactorRadarChart';
import { AnimatedCounter } from './AnimatedCounter';
import {
  Clock,
  IndianRupee,
  Wind,
  Hospital,
  Train,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Bookmark,
  Scale,
  Check,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  MapPin
} from 'lucide-react';

interface AreaCardProps {
  area: RankedNeighborhood;
  isExcluded?: boolean;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (key: string) => void;
  onToggleCompare: (area: RankedNeighborhood) => void;
  onSelect: (area: RankedNeighborhood) => void;
  onHover: (area: RankedNeighborhood | null) => void;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  isExcluded = false,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onSelect,
  onHover
}) => {
  const [showRadar, setShowRadar] = useState(false);
  const [showQualityTooltip, setShowQualityTooltip] = useState(false);

  const getRankBadge = () => {
    if (isExcluded) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#334155]/20 text-[#64748B] border border-[#334155]/50 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          <span>Excluded</span>
        </span>
      );
    }
    if (area.rank === 1) {
      return (
        <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
          <span>Front 1 • Optimal</span>
        </span>
      );
    }
    if (area.rank === 2) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#475569]/15 text-[#94A3B8] border border-[#475569]/35 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />
          <span>Front 2</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#6B5B95]/15 text-[#A78BFA] border border-[#6B5B95]/30 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6B5B95]" />
        <span>Front {area.rank}</span>
      </span>
    );
  };

  const getAqiBadge = (aqi: number) => {
    if (aqi <= 60) {
      return {
        text: 'Good',
        color: 'text-[#0D9488] bg-[#0D9488]/10 border-[#0D9488]/25',
        dot: 'bg-[#0D9488]'
      };
    }
    if (aqi <= 85) {
      return {
        text: 'Moderate',
        color: 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/25',
        dot: 'bg-[#D97706]'
      };
    }
    return {
      text: 'Unhealthy',
      color: 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/25',
      dot: 'bg-[#E11D48]'
    };
  };

  const verifiedCount = area.dataQuality?.verifiedFactorsCount ?? (area.rent !== null ? 5 : 4);
  const isRentVerified = area.rent !== null && area.rentAvailable !== false;
  const isAqiMeasured = area.aqiSource === 'cpcb_measured';
  const aqiInfo = getAqiBadge(area.aqi);

  return (
    <div
      onMouseEnter={() => onHover(area)}
      onMouseLeave={() => onHover(null)}
      className={`rounded-xl p-4 sm:p-5 transition-colors border shadow-card ${
        isExcluded
          ? 'opacity-65 border-[#1F2937] bg-[#141B2D]/60'
          : area.rank === 1
          ? 'border-[#0D9488]/40 hover:border-[#0D9488] bg-[#141B2D]'
          : 'border-[#1F2937] hover:border-[#374151] bg-[#141B2D]'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onSelect(area)}
              className="font-semibold text-base sm:text-lg text-[#E2E8F0] tracking-tight cursor-pointer hover:text-[#0D9488] transition-colors"
            >
              {area.name}
            </h3>

            {area.metroConnected && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A2332] text-[#94A3B8] border border-[#1F2937]"
                title="Direct Metro Corridor Connection"
              >
                <Train className="w-3 h-3 text-[#0D9488]" />
                <span>Metro</span>
              </span>
            )}

            {(area.isGridFallback || area.boundarySource === 'voronoi_grid') && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A2332] text-[#94A3B8] border border-[#1F2937]"
                title="Synthesized micro-market sector via Voronoi spatial grid"
              >
                <span>Modeled Area</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#64748B]" />
              <span>{area.zone}</span>
            </span>
            <span>•</span>
            <span className="font-mono text-[#64748B]">{area.commuteDistanceKm} km away</span>
          </div>
        </div>

        {/* Right Badges & Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {getRankBadge()}

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => onToggleSave(area.key)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-[#D97706]/15 border-[#D97706]/35 text-[#D97706]'
                : 'bg-transparent border-[#1F2937] text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2332]'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Area'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#D97706]' : ''}`} />
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => onToggleCompare(area)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              isCompared
                ? 'bg-[#0D9488]/15 border-[#0D9488]/35 text-[#0D9488]'
                : 'bg-transparent border-[#1F2937] text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#1A2332]'
            }`}
            title={isCompared ? 'Remove from Comparison' : 'Add to Compare'}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Rent Pillar */}
        <div className="p-2.5 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <IndianRupee className="w-3 h-3 text-[#64748B]" />
            <span>Monthly Rent</span>
          </div>
          <div className="mt-1">
            {area.rent !== null ? (
              <>
                <p className="text-sm font-semibold text-[#E2E8F0] font-mono">
                  <AnimatedCounter value={area.rent} prefix="₹" />
                </p>
                <span className="text-[10px] text-[#64748B]">Survey benchmark</span>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-[#D97706] mt-0.5">Unsurveyed</p>
                <span className="text-[10px] text-[#64748B]">No estimate</span>
              </>
            )}
          </div>
        </div>

        {/* Commute Pillar */}
        <div className="p-2.5 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Clock className="w-3 h-3 text-[#64748B]" />
            <span>Commute Time</span>
          </div>
          <div className="mt-1">
            <p className="text-sm font-semibold text-[#E2E8F0] font-mono">
              <AnimatedCounter value={Math.round(area.commuteMinutes)} suffix=" mins" />
            </p>
            <span className="text-[10px] text-[#64748B]">OSRM road graph</span>
          </div>
        </div>

        {/* Air Quality Pillar */}
        <div className="p-2.5 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Wind className="w-3 h-3 text-[#64748B]" />
            <span>Ambient AQI</span>
          </div>
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-[#E2E8F0] font-mono">
                <AnimatedCounter value={Math.round(area.aqi)} />
              </p>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium flex items-center gap-1 ${aqiInfo.color}`}>
                <span className={`w-1 h-1 rounded-full ${aqiInfo.dot}`} />
                <span>{aqiInfo.text}</span>
              </span>
            </div>
            <span className="text-[10px] text-[#64748B]">
              {isAqiMeasured ? 'CPCB Station' : 'OWM Model'}
            </span>
          </div>
        </div>

        {/* Amenities Pillar */}
        <div className="p-2.5 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
            <Hospital className="w-3 h-3 text-[#64748B]" />
            <span>Amenities</span>
          </div>
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-[#E2E8F0]">
              <span className="font-mono font-medium">{area.hospitalCount}</span> hospitals
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              <span className="font-mono font-medium">{area.groceryCount}</span> daily markets
            </p>
          </div>
        </div>
      </div>

      {/* Exclusion Notice if Filtered */}
      {isExcluded && area.exclusionReasons?.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#141B2D] border border-rose-900/40 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
            <AlertTriangle className="w-3 h-3" />
            <span>Exclusion Reason:</span>
          </div>
          <p className="text-xs text-[#94A3B8] pl-4">
            {area.exclusionReasons.join(' • ')}
          </p>
        </div>
      )}

      {/* Card Action Footer Bar */}
      <div className="mt-3.5 pt-3 border-t border-[#1F2937] flex items-center justify-between gap-2 text-xs">
        {/* Ground Truth Coverage Indicator */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowQualityTooltip(true)}
            onMouseLeave={() => setShowQualityTooltip(false)}
            onClick={() => setShowQualityTooltip(!showQualityTooltip)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-[#94A3B8] hover:text-[#E2E8F0] bg-transparent hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-[#0D9488]" />
            <span>Coverage: {verifiedCount}/5 Ground Truth</span>
            <HelpCircle className="w-3 h-3 text-[#64748B]" />
          </button>

          {/* Quality Popover */}
          {showQualityTooltip && (
            <div className="absolute bottom-full left-0 mb-2 z-40 w-60 p-3 rounded-lg bg-[#1A2332] border border-[#1F2937] shadow-elevated text-[11px] space-y-1.5 text-[#94A3B8]">
              <div className="font-medium text-[#E2E8F0] text-xs border-b border-[#1F2937] pb-1 flex items-center justify-between">
                <span>Ground Truth Coverage</span>
                <span className="text-[#0D9488]">{verifiedCount}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Rent:</span>
                <span className={isRentVerified ? 'text-[#0D9488]' : 'text-[#D97706]'}>
                  {isRentVerified ? 'Survey benchmark' : 'Unsurveyed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AQI:</span>
                <span className="text-[#E2E8F0]">
                  {isAqiMeasured ? 'CPCB CAAQMS Station' : 'OWM Model'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Routing:</span>
                <span className="text-[#E2E8F0]">OSRM Peak Graph</span>
              </div>
            </div>
          )}
        </div>

        {/* Radar & Inspect Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRadar(!showRadar)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-[#94A3B8] hover:text-[#E2E8F0] bg-transparent hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
          >
            <span>Radar</span>
            {showRadar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => onSelect(area)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors"
          >
            <span>Inspect</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expandable Factor Radar Chart */}
      <AnimatePresence>
        {showRadar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-3 mt-3 border-t border-[#1F2937]"
          >
            <div className="p-3 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="w-48 h-48 flex items-center justify-center">
                <FactorRadarChart
                  scores={
                    area.radarScores || {
                      affordability: 70,
                      commuteConvenience: 75,
                      airQuality: 65,
                      healthcareAccess: 80,
                      dailyNeeds: 85
                    }
                  }
                  size={170}
                />
              </div>
              <div className="space-y-1.5 text-xs max-w-xs">
                <h4 className="font-semibold text-[#E2E8F0] text-xs">Normalized Criteria (0-100)</h4>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  Higher scores indicate superior relative suitability across the active candidate set.
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#94A3B8] pt-1 font-mono">
                  <div>Affordability: {Math.round(area.radarScores?.affordability ?? 70)}</div>
                  <div>Commute: {Math.round(area.radarScores?.commuteConvenience ?? 75)}</div>
                  <div>Air Quality: {Math.round(area.radarScores?.airQuality ?? 65)}</div>
                  <div>Healthcare: {Math.round(area.radarScores?.healthcareAccess ?? 80)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
