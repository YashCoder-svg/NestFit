import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  Loader2,
  MapPin,
  Building,
  Wind,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface IngestionProgressModalProps {
  cityName: string;
  isOpen: boolean;
}

export const IngestionProgressModal: React.FC<IngestionProgressModalProps> = ({
  cityName,
  isOpen
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [elapsed, setElapsed] = useState(0);

  const steps = [
    {
      title: 'Geocoding Urban Boundary',
      desc: 'Nominatim geocoding to resolve spatial bounding box and administrative extent',
      icon: MapPin
    },
    {
      title: 'Locality & Suburb Discovery',
      desc: 'Querying Overpass for administrative micro-markets with grid fallback',
      icon: Building
    },
    {
      title: 'Healthcare & Grocery POIs Extraction',
      desc: 'Batch spatial query for hospitals, clinics, and supermarkets across micro-markets',
      icon: Sparkles
    },
    {
      title: 'Ambient Air Quality Verification',
      desc: 'Scanning CPCB CAAQMS stations within 5km, falling back to OpenWeatherMap modeled AQI',
      icon: Wind
    },
    {
      title: 'Rent Benchmarking & Pareto Formulation',
      desc: 'Cross-referencing verified surveys (no fabricated rent) & compiling objective vectors',
      icon: ShieldCheck
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(15);
      setElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / steps.length) * 95));
          return next;
        }
        return prev;
      });
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 bg-slate-900/95"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <Compass className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Analyzing {cityName}...
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                Live Ingestion
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Building on-demand location intelligence • Elapsed: {elapsed}s
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Pipeline Progress</span>
            <span className="text-emerald-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stepper Checklist */}
        <div className="mt-6 space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-950/20 border-slate-900 opacity-40'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-semibold">Done</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-amber-300 font-semibold animate-pulse">
                        In progress...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fair-use Rate Limiting Notice */}
        <div className="mt-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Requests are rate-limited (&ge;1 req/sec) to respect OpenStreetMap Nominatim and Overpass
            fair-use policies. Ingested cities are cached in MongoDB for 7 days.
          </span>
        </div>
      </motion.div>
    </div>
  );
};
