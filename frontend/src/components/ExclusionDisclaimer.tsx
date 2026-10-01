import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ExclusionDisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExclusionDisclaimer: React.FC<ExclusionDisclaimerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0B1120]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#1A2332] border border-[#1F2937] rounded-xl p-6 sm:p-7 shadow-modal space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center text-[#D97706]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#E2E8F0]">Data Ethics & Factor Limitations</h3>
            <p className="text-xs text-[#64748B]">Explicit exclusion of crime and safety proxy metrics</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-[#94A3B8] leading-relaxed bg-[#141B2D] p-4 rounded-lg border border-[#1F2937]">
          <p>
            <strong className="text-[#E2E8F0]">Factor Excluded:</strong> <span className="text-[#D97706] font-medium">Crime & Safety</span>
          </p>
          <p>
            In accordance with data engineering ethics, NestFit <strong>does not synthesize or fabricate safety scores</strong>. 
            No standardized, verified, ward-level public crime dataset is published for Indian cities.
          </p>
          <p>
            Fabricating proxy metrics creates demographic and economic bias against emerging or affordable neighborhoods. 
            We score only factors with ground-truth public APIs:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#64748B] pl-1 font-mono text-[11px]">
            <li>Commute: OSRM engine + peak traffic heuristics</li>
            <li>Healthcare & Groceries: OpenStreetMap Overpass live queries</li>
            <li>Air Quality: CPCB CAAQMS stations + OpenWeatherMap Air API</li>
            <li>Rent: 2024–2025 verified micro-market surveys</li>
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
