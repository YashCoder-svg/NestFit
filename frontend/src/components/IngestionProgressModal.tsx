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
      desc: 'Resolving spatial bounding box and administrative extent',
      icon: MapPin
    },
    {
      title: 'Locality & Suburb Discovery',
      desc: 'Querying Overpass for micro-markets with Voronoi grid fallback',
      icon: Building
    },
    {
      title: 'Healthcare & Grocery POIs Extraction',
      desc: 'Spatial query for hospitals, clinics, and retail markets',
      icon: Sparkles
    },
    {
      title: 'Ambient Air Quality Verification',
      desc: 'Scanning CPCB CAAQMS stations, falling back to OWM modeled AQI',
      icon: Wind
    },
    {
      title: 'Pareto Formulation & Objective Vectors',
      desc: 'Compiling non-dominated sorting candidate sets (zero fabricated rent)',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-[#1A2332] rounded-xl p-6 sm:p-7 border border-[#1F2937] shadow-modal space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center text-[#0D9488]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#E2E8F0]">
                Ingesting {cityName}...
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                Live Pipeline
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Compiling location intelligence dataset • {elapsed}s elapsed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Pipeline Status</span>
            <span className="text-[#0D9488] font-mono font-medium">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#141B2D] border border-[#1F2937] overflow-hidden">
            <div
              className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stepper Checklist */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border transition-colors flex items-start gap-2.5 ${
                  isCurrent
                    ? 'bg-[#141B2D] border-[#0D9488]/40'
                    : isCompleted
                    ? 'bg-[#141B2D]/50 border-[#1F2937] opacity-80'
                    : 'bg-[#141B2D]/20 border-[#1F2937]/50 opacity-40'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#0D9488] animate-spin" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-[#64748B]" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#E2E8F0]">
                      {step.title}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-[#0D9488] font-medium">Done</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-[#D97706] font-medium">
                        Processing...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice */}
        <div className="p-3 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center gap-2 text-[11px] text-[#64748B]">
          <Info className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <span>
            External APIs are rate-limited to respect fair-use policies. Ingested cities are cached for 7 days.
          </span>
        </div>
      </motion.div>
    </div>
  );
};
