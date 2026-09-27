import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RankedNeighborhood } from '../types';
import { FactorRadarChart } from './FactorRadarChart';
import { AnimatedCounter } from './AnimatedCounter';
import {
  Clock,
  IndianRupee,
  Wind,
  Hospital,
  ShoppingBag,
  Train,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Bookmark,
  Scale,
  Check,
  ShieldCheck,
  HelpCircle
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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
          Filtered Out
        </span>
      );
    }
    if (area.rank === 1) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 flex items-center gap-1">
          <span className="text-emerald-400">★</span> Front 1 • Pareto Optimal
        </span>
      );
    }
    if (area.rank === 2) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
          Front 2 • Trade-off
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
        Front {area.rank}
      </span>
    );
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 60) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (aqi <= 85) return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const verifiedCount = area.dataQuality?.verifiedFactorsCount ?? (area.rent !== null ? 5 : 4);
  const isRentVerified = area.rent !== null && area.rentAvailable !== false;
  const isAqiMeasured = area.aqiSource === 'cpcb_measured';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onMouseEnter={() => onHover(area)}
      onMouseLeave={() => onHover(null)}
      className={`glass-panel rounded-3xl p-5 sm:p-6 transition-all border ${
        isExcluded
          ? 'opacity-60 border-slate-800 bg-slate-950/40'
          : area.rank === 1
          ? 'border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-500/10 bg-slate-900/70'
          : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-lg text-white tracking-tight">{area.name}</h3>
            {area.metroConnected && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                title="Metro station nearby"
              >
                <Train className="w-3 h-3" />
                <span>Metro Connected</span>
              </span>
            )}
            {(area.isGridFallback || area.boundarySource === 'voronoi_grid') && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                title="Synthesized micro-market sector via Voronoi spatial tessellation clipped to city bounds"
              >
                <span>📐</span>
                <span>Spatial Voronoi Grid</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{area.zone}</p>
        </div>

        <div className="flex items-center gap-2">
          {getRankBadge()}

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleSave(area.key)}
            className={`p-1.5 rounded-xl border transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Area'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Compare Button */}
          <button
            onClick={() => onToggleCompare(area)}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              isCompared
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={isCompared ? 'Remove from Comparison' : 'Add to Compare'}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Visible Data-Quality Badge */}
      <div className="mt-3 flex items-center gap-2 relative">
        <div
          onMouseEnter={() => setShowQualityTooltip(true)}
          onMouseLeave={() => setShowQualityTooltip(false)}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
            verifiedCount === 5
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Coverage: {verifiedCount}/5 Factors</span>
          <span className="text-[10px] font-normal text-slate-400">
            ({isRentVerified ? 'Real Rent' : 'Rent Unverified'} • {isAqiMeasured ? 'CPCB' : 'OWM Modeled'})
          </span>
          <HelpCircle className="w-3 h-3 text-slate-500" />
        </div>

        {/* Quality Tooltip Popover */}
        {showQualityTooltip && (
          <div className="absolute top-full left-0 mt-1 z-30 w-72 p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl text-[11px] space-y-1.5 text-slate-300 animate-fadeIn">
            <div className="font-bold text-white text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Factor Integrity Breakdown</span>
              <span className="text-emerald-400">{verifiedCount}/5 Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rent:</span>
              <span className={`font-semibold ${isRentVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isRentVerified ? 'Verified Survey' : 'Not available (Unsurveyed)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Air Quality:</span>
              <span className={`font-semibold ${isAqiMeasured ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {isAqiMeasured ? 'measured (CPCB)' : 'modeled estimate (OpenWeatherMap)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Commute:</span>
              <span className="text-emerald-400 font-semibold">OSRM Live Graph</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Amenities:</span>
              <span className="text-emerald-400 font-semibold">OpenStreetMap Live POIs</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Boundary:</span>
              <span className={`font-semibold ${(area.isGridFallback || area.boundarySource === 'voronoi_grid') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {(area.isGridFallback || area.boundarySource === 'voronoi_grid') ? 'Voronoi Spatial Sector' : 'OSM Official Suburb'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Excluded Reasons if Filtered */}
      {isExcluded && area.exclusionReasons?.length > 0 && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Exclusion Threshold Exceeded:</span>
          </div>
          <ul className="text-xs text-rose-300/90 list-disc list-inside space-y-0.5">
            {area.exclusionReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metrics Grid with Animated Counters */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Rent */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monthly Rent</span>
          </div>
          {area.rent !== null ? (
            <>
              <p className="text-base font-extrabold text-slate-100 mt-1">
                <AnimatedCounter value={area.rent} prefix="₹" />
              </p>
              <span className="text-[10px] text-emerald-400 font-medium">Verified Benchmark</span>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-amber-300 mt-1.5">
                Not available for this city
              </p>
              <span className="text-[10px] text-slate-500">Zero Fabricated Figures</span>
            </>
          )}
        </div>

        {/* Commute */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Commute Time</span>
          </div>
          <p className="text-base font-extrabold text-slate-100 mt-1">
            <AnimatedCounter value={Math.round(area.commuteMinutes)} suffix=" mins" />
          </p>
          <span className="text-[10px] text-slate-500">{area.commuteDistanceKm} km OSRM</span>
        </div>

        {/* AQI */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Air Quality</span>
          </div>
          <p className="text-base font-extrabold text-slate-100 mt-1 flex items-center gap-1.5">
            <AnimatedCounter value={Math.round(area.aqi)} />
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getAqiColor(
                area.aqi
              )}`}
            >
              {area.aqi <= 60 ? 'Good' : area.aqi <= 85 ? 'Mod' : 'Poor'}
            </span>
          </p>
          <span
            className={`text-[10px] font-semibold block truncate ${
              isAqiMeasured ? 'text-emerald-400' : 'text-cyan-400'
            }`}
            title={area.cpcbStationName || 'Station details'}
          >
            {isAqiMeasured ? 'measured (CPCB)' : 'modeled estimate (OpenWeatherMap)'}
          </span>
        </div>

        {/* Healthcare & Daily Needs */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Hospital className="w-3.5 h-3.5 text-purple-400" />
            <span>Amenities</span>
          </div>
          <p className="text-xs font-bold text-slate-200 mt-1.5">
            {area.hospitalCount} Hosp • {area.groceryCount} Groc
          </p>
          <span className="text-[10px] text-slate-500">OSM Live POIs</span>
        </div>
      </div>

      {/* Expandable Radar Chart Breakdown */}
      {showRadar && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col items-center"
        >
          <div className="text-xs font-bold text-slate-400 mb-2">
            Multi-Objective Normalized Radar Profile (0 - 100)
          </div>
          <FactorRadarChart scores={area.radarScores} size={190} />
        </motion.div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/60 flex items-center justify-between">
        <button
          onClick={() => setShowRadar(!showRadar)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors"
        >
          {showRadar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{showRadar ? 'Hide Factor Radar' : 'View Factor Radar'}</span>
        </button>

        <button
          onClick={() => onSelect(area)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Area Deep-Dive</span>
        </button>
      </div>
    </motion.div>
  );
};
