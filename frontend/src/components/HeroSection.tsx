import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, Zap, MapPin } from 'lucide-react';
import { Workplace } from '../types';

interface HeroSectionProps {
  workplaces: Workplace[];
  selectedWorkplace: { name: string; lat: number; lon: number };
  onSelectWorkplace: (wp: Workplace) => void;
  executionTimeMs?: number;
  paretoCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  workplaces,
  selectedWorkplace,
  onSelectWorkplace,
  executionTimeMs,
  paretoCount
}) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-4 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/40 via-slate-950/20 to-transparent">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Factor Pareto Frontier Optimization</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Find where you fit in Bangalore,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                not just where you rent.
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              NestFit scores Bangalore micro-markets across real-time commute, rental benchmarks, 
              air quality (AQI), and healthcare density to deliver the non-dominated Pareto frontier — 
              zero arbitrary weights.
            </p>
          </motion.div>

          {/* Quick Metrics Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-xs"
          >
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{paretoCount} Frontier Areas</span>
            </div>
            {executionTimeMs !== undefined && (
              <div className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Computed in <strong className="text-slate-200">{executionTimeMs}ms</strong></span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Workplace Quick Chips */}
        <div className="mt-5 pt-3 border-t border-slate-800/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Bangalore Tech Park / Workplace Hub:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {workplaces.map(wp => {
              const isSelected = selectedWorkplace.name === wp.name;
              return (
                <button
                  key={wp.key}
                  onClick={() => onSelectWorkplace(wp)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30 scale-[1.02]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                  <span>{wp.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
