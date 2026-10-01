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
    <div className="relative overflow-hidden pt-6 pb-4 border-b border-[#1F2937] bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D9488]/10 border border-[#0D9488]/20 text-[#0D9488] text-xs font-medium mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Factor Pareto Frontier Optimization</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#E2E8F0] leading-tight">
              Find where you fit in Bangalore,{' '}
              <span className="text-[#94A3B8]">
                not just where you rent.
              </span>
            </h1>

            <p className="mt-2 text-sm text-[#94A3B8] max-w-xl">
              NestFit scores Bangalore micro-markets across real-time commute, rental benchmarks, 
              air quality (AQI), and healthcare density to deliver the non-dominated Pareto frontier — 
              zero arbitrary weights.
            </p>
          </motion.div>

          {/* Quick Metrics Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-[#141B2D] border border-[#1F2937] p-2.5 rounded-xl text-xs"
          >
            <div className="px-2.5 py-1 rounded-md bg-[#0D9488]/10 border border-[#0D9488]/20 text-[#0D9488] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              <span>{paretoCount} Frontier Areas</span>
            </div>
            {executionTimeMs !== undefined && (
              <div className="flex items-center gap-1 text-[#94A3B8]">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Computed in <strong className="text-[#E2E8F0] font-medium">{executionTimeMs}ms</strong></span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Workplace Quick Chips */}
        <div className="mt-5 pt-3 border-t border-[#1F2937]">
          <div className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Select Tech Park / Workplace Hub:</span>
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
                      ? 'bg-[#0D9488] text-[#E2E8F0] shadow-sm'
                      : 'bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937]'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-[#E2E8F0]' : 'text-[#64748B]'}`} />
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
