import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sliders, Sparkles, Map, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to NestFit',
      subtitle: 'Multi-Objective Location Intelligence Engine',
      icon: <Compass className="w-5 h-5 text-[#0D9488]" />,
      content: (
        <div className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
          <p>
            Unlike real estate portals that focus on individual flat listings, 
            <strong className="text-[#E2E8F0]"> NestFit analyzes entire city micro-markets</strong> to evaluate 
            where you fit best across commute, rent, air quality, and daily infrastructure.
          </p>
          <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937] text-[11px] text-[#E2E8F0]">
            Select between <strong>Bangalore</strong> and <strong>Pune</strong> with verified OSRM commute graphs, 
            CPCB continuous ambient air data, and OpenStreetMap amenities.
          </div>
        </div>
      )
    },
    {
      title: 'Real Multi-Factor Constraints',
      subtitle: 'Live Debounced Filtering',
      icon: <Sliders className="w-5 h-5 text-[#94A3B8]" />,
      content: (
        <div className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
          <p>
            Select your target tech campus or office hub. Then set non-negotiable parameters 
            including <strong className="text-[#E2E8F0]">Max Rent Ceiling</strong>, <strong className="text-[#E2E8F0]">Max Commute Time</strong>, 
            and <strong className="text-[#E2E8F0]">Transit Mode</strong> (Driving vs. Public Transit).
          </p>
          <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937] text-[11px] text-[#94A3B8]">
            As constraints change, candidates update live. Any area violating a parameter is partitioned into the 
            <em> Excluded</em> tab with explicit rationale.
          </div>
        </div>
      )
    },
    {
      title: 'The Pareto Frontier Advantage',
      subtitle: 'Why Linear Scoring Conceals Trade-offs',
      icon: <Sparkles className="w-5 h-5 text-[#0D9488]" />,
      content: (
        <div className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
          <p>
            Traditional search computes a single weighted score (e.g. 0.4*Rent + 0.3*Commute). 
            This obscures critical trade-offs: an area with a grueling 90-minute commute can rank #1 if rent is marginally cheaper.
          </p>
          <div className="p-3 rounded-lg bg-[#141B2D] border border-[#0D9488]/30 text-[11px] text-[#E2E8F0]">
            NestFit uses Deb's Fast Non-Dominated Sorting algorithm. <strong>Front 1</strong> contains the true Pareto frontier — 
            where no neighborhood is strictly superior across all 5 dimensions.
          </div>
        </div>
      )
    },
    {
      title: 'Interactive Leaflet Choropleth Map',
      subtitle: 'Geospatial Visual Intelligence',
      icon: <Map className="w-5 h-5 text-[#94A3B8]" />,
      content: (
        <div className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed">
          <p>
            Explore neighborhood polygons directly on the map. Shading reflects mathematical Pareto ranking:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 font-medium">
            <div className="flex items-center gap-1.5 p-2 rounded bg-[#141B2D] border border-[#1F2937] text-[#0D9488]">
              <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
              <span>Front 1: Optimal</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-[#141B2D] border border-[#1F2937] text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-[#475569]" />
              <span>Front 2: Balanced</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-[#141B2D] border border-[#1F2937] text-[#A78BFA]">
              <span className="w-2 h-2 rounded-full bg-[#6B5B95]" />
              <span>Front 3+: Dominated</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded bg-[#141B2D] border border-[#1F2937] text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-[#334155]" />
              <span>Excluded</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleFinish = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-lg bg-[#1A2332] border border-[#1F2937] rounded-xl p-6 shadow-modal space-y-5"
        >
          {/* Close button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 text-[#64748B] hover:text-[#E2E8F0] p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center">
              {steps[step].icon}
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
                Step {step + 1} of {steps.length}
              </span>
              <h3 className="text-base font-semibold text-[#E2E8F0]">{steps[step].title}</h3>
              <p className="text-xs text-[#94A3B8]">{steps[step].subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[140px] flex items-center">
            {steps[step].content}
          </div>

          {/* Step Indicators & Navigation */}
          <div className="flex items-center justify-between pt-3.5 border-t border-[#1F2937]">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-5 bg-[#0D9488]' : 'w-2 bg-[#334155]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#253043] border border-[#1F2937] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                  Back
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
