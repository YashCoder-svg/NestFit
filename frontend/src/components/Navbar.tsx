import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { CityId } from '../types';
import { CityAutocomplete } from './CityAutocomplete';
import {
  Compass,
  Moon,
  Sun,
  ShieldAlert,
  Sparkles,
  Scale,
  Bookmark,
  Share2,
  HelpCircle,
  Check
} from 'lucide-react';

interface NavbarProps {
  city: CityId;
  onCityChange: (cityKey: string, cityName?: string, isCached?: boolean, lat?: number, lon?: number) => void;
  algorithm: 'pareto' | 'weighted';
  optimalCount: number;
  compareCount?: number;
  savedCount?: number;
  onOpenCompare?: () => void;
  onOpenSaved?: () => void;
  onOpenTour?: () => void;
  onOpenInfo: () => void;
  onShare?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  city,
  onCityChange,
  algorithm,
  optimalCount,
  compareCount = 0,
  savedCount = 0,
  onOpenCompare,
  onOpenSaved,
  onOpenTour,
  onOpenInfo,
  onShare
}) => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1120] border-b border-[#1F2937]">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Link to Home */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center text-[#0D9488]">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg tracking-tight text-[#E2E8F0]">
              NestFit
            </span>
            <span className="text-[11px] font-medium tracking-wide px-2 py-0.5 rounded bg-[#141B2D] text-[#94A3B8] border border-[#1F2937]">
              v2.0
            </span>
          </div>
        </Link>

        {/* Center: City Selector & Engine Stats */}
        <div className="flex items-center gap-3">
          <CityAutocomplete
            currentCityId={city}
            onSelectCity={(key, name, isCached, lat, lon) => onCityChange(key, name, isCached, lat, lon)}
            variant="navbar"
          />

          {/* Engine Mode Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141B2D] border border-[#1F2937] text-xs">
            <span className="text-[#94A3B8]">Algorithm:</span>
            <span className="font-medium text-[#E2E8F0] capitalize">
              {algorithm === 'pareto' ? 'Pareto Frontier' : 'Weighted Scoring'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#0D9488]/15 text-[#0D9488] text-[11px] font-mono font-medium border border-[#0D9488]/30">
              {optimalCount} Front 1
            </span>
          </div>
        </div>

        {/* Right Tools & Actions (Grouped Actions with dividers) */}
        <div className="flex items-center gap-2">
          {/* Action Group Capsule */}
          <div className="flex items-center bg-[#141B2D] border border-[#1F2937] rounded-lg overflow-hidden divide-x divide-[#1F2937]">
            {/* Compare Button */}
            {onOpenCompare && (
              <button
                onClick={onOpenCompare}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2332] transition-colors"
                title="Compare selected neighborhoods"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compare</span>
                {compareCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0D9488]/20 text-[#0D9488] border border-[#0D9488]/30">
                    {compareCount}
                  </span>
                )}
              </button>
            )}

            {/* Saved Button */}
            {onOpenSaved && (
              <button
                onClick={onOpenSaved}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2332] transition-colors"
                title="View bookmarked neighborhoods"
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-[#D97706]' : ''}`} />
                <span className="hidden sm:inline">Saved</span>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2332] transition-colors"
              title="Share filtered view URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#0D9488]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Secondary Controls Group */}
          <div className="flex items-center gap-1.5 pl-1">
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
                title="Start Onboarding Walkthrough"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenInfo}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#D97706] bg-[#141B2D] hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
              title="Data Ethics & Limitations"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D97706]" /> : <Moon className="w-4 h-4 text-[#94A3B8]" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
