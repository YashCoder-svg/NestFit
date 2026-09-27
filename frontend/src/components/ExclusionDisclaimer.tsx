import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface ExclusionDisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExclusionDisclaimer: React.FC<ExclusionDisclaimerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Data Ethics & Factor Limitations</h3>
            <p className="text-xs text-slate-400">Why crime/safety scores are excluded from NestFit</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p>
            <strong>Factor Excluded:</strong> <span className="text-amber-300 font-semibold">Crime & Safety</span>
          </p>
          <p>
            In accordance with sound data engineering ethics, NestFit <strong>does not synthesize or fabricate safety scores</strong>. 
            Unlike general POIs or travel times, crime datasets at the micro-market or ward level are neither published nor standardized 
            with verifiable granular coverage for Bangalore.
          </p>
          <p>
            Fabricating proxy metrics (such as streetlight counts or arbitrary survey scores) creates discriminatory bias against developing 
            or affordable areas. We strictly score factors with verified public APIs:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
            <li><strong>Commute:</strong> Open Source Routing Machine (OSRM) + peak traffic model</li>
            <li><strong>Healthcare & Groceries:</strong> OpenStreetMap Overpass live geospatial query</li>
            <li><strong>Air Quality:</strong> CPCB Continuous Ambient Stations + OpenWeatherMap Air API</li>
            <li><strong>Rent:</strong> 2024-2025 Bangalore Residential Index (labeled as estimated)</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
