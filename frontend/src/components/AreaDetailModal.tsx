import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankedNeighborhood } from '../types';
import { FactorRadarChart } from './FactorRadarChart';
import {
  X,
  MapPin,
  Clock,
  IndianRupee,
  Wind,
  Hospital,
  ShoppingBag,
  Train,
  AlertCircle
} from 'lucide-react';

interface AreaDetailModalProps {
  area: RankedNeighborhood | null;
  workplaceName: string;
  onClose: () => void;
}

export const AreaDetailModal: React.FC<AreaDetailModalProps> = ({
  area,
  workplaceName,
  onClose
}) => {
  if (!area) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-2xl bg-[#1A2332] border border-[#1F2937] rounded-xl p-6 sm:p-7 shadow-modal z-10 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#E2E8F0]">{area.name}</h2>
                {area.rank === 1 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                    Front 1 • Optimal
                  </span>
                )}
                {area.metroConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#141B2D] text-[#94A3B8] border border-[#1F2937]">
                    <Train className="w-3 h-3 text-[#0D9488]" />
                    <span>Metro Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                <span>{area.zone} • Coordinates: [{area.centroid.lat.toFixed(4)}, {area.centroid.lon.toFixed(4)}]</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#253043] border border-[#1F2937] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed bg-[#141B2D] p-3.5 rounded-lg border border-[#1F2937]">
            {area.description}
          </p>

          {/* Lifestyle Tags */}
          {area.tags && area.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {area.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#141B2D] text-[#94A3B8] border border-[#1F2937]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Metrics Deep Dive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <IndianRupee className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Monthly Rent</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {area.rent !== null ? `₹${area.rent.toLocaleString('en-IN')}` : 'Unsurveyed'}
              </div>
              <span className="text-[10px] text-[#64748B]">
                {area.rent !== null ? 'Benchmark Survey' : 'No synthetic guess'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Commute Time</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {Math.round(area.commuteMinutes)} mins
              </div>
              <span className="text-[10px] text-[#64748B]">to {workplaceName}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Wind className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Air Quality (AQI)</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {Math.round(area.aqi)}
              </div>
              <span className="text-[10px] text-[#64748B]">
                {area.aqiSource === 'cpcb_measured' ? 'CPCB CAAQMS Station' : 'OWM Model'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Hospital className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Healthcare</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {area.hospitalCount}
              </div>
              <span className="text-[10px] text-[#64748B]">Hospitals & Clinics</span>
            </div>

            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <ShoppingBag className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Daily Needs</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {area.groceryCount}
              </div>
              <span className="text-[10px] text-[#64748B]">Retail Markets</span>
            </div>

            <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937]">
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Train className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Transit Index</span>
              </div>
              <div className="text-base font-semibold text-[#E2E8F0] font-mono mt-1">
                {area.transitScore}/100
              </div>
              <span className="text-[10px] text-[#64748B]">Corridor Density</span>
            </div>
          </div>

          {/* Factor Radar Profile */}
          <div className="p-4 rounded-lg bg-[#141B2D] border border-[#1F2937] flex flex-col items-center">
            <h4 className="text-xs font-medium text-[#64748B] mb-2 uppercase tracking-wider">
              Normalized Criteria Radar Profile
            </h4>
            <FactorRadarChart scores={area.radarScores} size={200} />
          </div>

          {/* Data Transparency Notice */}
          <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937] text-xs text-[#64748B] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[#94A3B8]">
              <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Data Provenance Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Rental rates reflect verified survey benchmarks. Commute durations are generated via OSRM peak graph calculations. Crime/safety data is intentionally omitted to avoid synthetic bias.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
