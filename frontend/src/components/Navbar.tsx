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
  MapPin,
  Scale,
  Bookmark,
  Share2,
  HelpCircle,
  Check,
  ChevronDown
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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Link to Home */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                NestFit
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">Location-Intelligence Engine</p>
          </div>
        </Link>

        {/* Center: City Selector & Engine Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dynamic City Autocomplete */}
          <CityAutocomplete
            currentCityId={city}
            onSelectCity={(key, name, isCached, lat, lon) => onCityChange(key, name, isCached, lat, lon)}
            variant="navbar"
          />


          {/* Engine Mode Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Mode:</span>
            <span className="font-semibold text-cyan-400 capitalize">
              {algorithm === 'pareto' ? 'Pareto Frontier' : 'Weighted Sum'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {optimalCount}
            </span>
          </div>
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Compare Button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                compareCount > 0
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800 hover:bg-slate-800'
              }`}
              title="Compare selected neighborhoods"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>
          )}

          {/* Saved Tab / Filter Button */}
          {onOpenSaved && (
            <button
              onClick={onOpenSaved}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                savedCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800 hover:bg-slate-800'
              }`}
              title="View bookmarked neighborhoods"
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Saved</span>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Share current filtered view"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden md:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          {/* Tour / Guide Button */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Start Onboarding Walkthrough"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {/* Data Limitations Button */}
          <button
            onClick={onOpenInfo}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Data Sources, CPCB AQI, and Ethics"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
