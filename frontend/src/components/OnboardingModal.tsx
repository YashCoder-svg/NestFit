import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Sliders, Map, Scale, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';

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
      subtitle: 'Personal Location-Intelligence Engine',
      icon: <Compass className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Unlike traditional housing portals that bombard you with individual flat listings, 
            <strong> NestFit analyzes entire city micro-markets</strong> to identify which neighborhoods 
            best match your life, commute, and budget.
          </p>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            🏙️ <strong>Multi-City Support:</strong> Select between <strong>Bangalore</strong> and <strong>Pune</strong> 
            with real-time OSRM commute routing, CPCB ambient air data, and OpenStreetMap amenities.
          </div>
        </div>
      )
    },
    {
      title: 'Real Multi-Factor Constraints',
      subtitle: 'Live Debounced Filtering',
      icon: <Sliders className="w-8 h-8 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Choose your target tech park or workplace (e.g. Manyata, Ecospace, Hinjawadi, or Kharadi). 
            Then adjust constraints like <strong>Max Rent Budget</strong>, <strong>Max Commute Time</strong>, 
            and <strong>Transit Mode</strong> (Driving vs. Public Transit / Metro).
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            ⚡ <strong>Instant Recalculation:</strong> As you move any slider, candidates are re-evaluated live. 
            Any area violating a constraint is gracefully moved to the <em>Excluded</em> tab with explicit explanation reasons.
          </div>
        </div>
      )
    },
    {
      title: 'The Pareto Frontier Advantage',
      subtitle: 'Why Linear Scoring Fails in Real Estate',
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Traditional portals assign a single weighted score (e.g. 0.4*Rent + 0.3*Commute). 
            This dangerously conceals trade-offs: an area with an exhausting 90-minute commute can rank #1 
            just because rent is slightly cheaper.
          </p>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            ★ <strong>Non-Dominated Sorting (Deb\'s Algorithm):</strong> NestFit discovers the 
            <strong> Pareto-optimal set</strong> — neighborhoods where no alternative is strictly better 
            across all lifestyle factors without compromise.
          </div>
        </div>
      )
    },
    {
      title: 'Map, Compare & Share',
      subtitle: 'Everything You Need to Decide',
      icon: <Map className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span><strong>Interactive Leaflet Map:</strong> Neighborhood boundaries colored by Pareto rank (Emerald for Front 1).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span><strong>Compare Mode:</strong> Pin 2-3 areas side-by-side to view direct factor deltas and overlaid radar profiles.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span><strong>Shareable Links & Favorites:</strong> Save top areas to localStorage and copy your exact filter state in the URL.</span>
            </li>
          </ul>
        </div>
      )
    }
  ];

  const handleFinish = () => {
    localStorage.setItem('nestfit_onboarding_completed', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Close button */}
          <button
            onClick={handleFinish}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg">
              {steps[step].icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">
                Step {step + 1} of {steps.length}
              </span>
              <h3 className="text-xl font-extrabold text-white">{steps[step].title}</h3>
              <p className="text-xs text-slate-400">{steps[step].subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-[160px] flex items-center">
            {steps[step].content}
          </div>

          {/* Step Indicators & Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back
                </button>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/25 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-md shadow-emerald-500/25 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Start Exploring</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
