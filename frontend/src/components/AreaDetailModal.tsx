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
  CheckCircle2,
  AlertCircle,
  ExternalLink
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-extrabold text-white">{area.name}</h2>
                {area.rank === 1 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ★ Front 1 • Pareto Optimal
                  </span>
                )}
                {area.metroConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    <Train className="w-3.5 h-3.5" />
                    <span>Namma Metro Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{area.zone} Bangalore • Centroid: [{area.centroid.lat.toFixed(4)}, {area.centroid.lon.toFixed(4)}]</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {area.description}
          </p>

          {/* Lifestyle Tags */}
          {area.tags && area.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {area.tags.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Metrics Deep Dive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <span>Monthly Rent</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {area.rent !== null ? `₹${area.rent.toLocaleString('en-IN')}` : 'Not available'}
              </div>
              <span className="text-[10px] text-slate-500">
                {area.rent !== null ? 'Benchmark Market Estimate' : 'Unsurveyed micro-market'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Travel Time</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {Math.round(area.commuteMinutes)} mins
              </div>
              <span className="text-[10px] text-slate-500">to {workplaceName}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Air Quality (AQI)</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {Math.round(area.aqi)}
              </div>
              <span className="text-[10px] text-slate-500">
                {area.aqiSource === 'cpcb_measured' ? 'measured (CPCB CAAQMS)' : 'modeled estimate (OpenWeatherMap)'}
              </span>
            </div>


            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Hospital className="w-4 h-4 text-purple-400" />
                <span>Hospitals & Clinics</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {area.hospitalCount}
              </div>
              <span className="text-[10px] text-slate-500">OpenStreetMap Overpass</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Daily Needs & Stores</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {area.groceryCount}
              </div>
              <span className="text-[10px] text-slate-500">Supermarkets & Retail</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Train className="w-4 h-4 text-indigo-400" />
                <span>Transit Score</span>
              </div>
              <div className="text-lg font-extrabold text-white mt-1">
                {area.transitScore}/100
              </div>
              <span className="text-[10px] text-slate-500">BMTC & Metro Index</span>
            </div>
          </div>

          {/* Factor Radar Visualization */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Multi-Objective Normalized Radar Profile
            </h4>
            <FactorRadarChart scores={area.radarScores} size={220} />
          </div>

          {/* Data Transparency & Limitations Footer */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Data Transparency Notice</span>
            </div>
            <p>
              Rent figures reflect 2024-2025 Bangalore residential benchmark indices and are labeled as 
              <strong> estimated</strong>. Commute durations are computed using the Open Source Routing Machine (OSRM) 
              with peak Bangalore traffic heuristics. Safety data is deliberately omitted due to lack of verified public spatial datasets.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
