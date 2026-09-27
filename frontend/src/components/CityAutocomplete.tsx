import React, { useState, useEffect, useRef } from 'react';
import { CitySearchResult } from '../types';
import { searchCitiesApi } from '../services/api';
import { MapPin, Search, Sparkles, Clock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface CityAutocompleteProps {
  currentCityId: string;
  onSelectCity: (cityKey: string, cityName: string, isCached: boolean, lat?: number, lon?: number) => void;
  variant?: 'navbar' | 'hero';
  className?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  currentCityId,
  onSelectCity,
  variant = 'navbar',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchCitiesApi(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (item: CitySearchResult) => {
    onSelectCity(item.id, item.name, item.isCached || item.isPreWarmed, item.lat, item.lon);
    setQuery('');
    setIsOpen(false);
  };

  const getCityDisplayName = (id: string) => {
    if (id === 'bangalore') return 'Bangalore';
    if (id === 'pune') return 'Pune';
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
  };

  if (variant === 'hero') {
    return (
      <div ref={containerRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
        {/* Search Input Box */}
        <div className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all">
          <div className="pl-4 pr-2 text-emerald-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => {
              setIsOpen(true);
              if (results.length === 0) {
                searchCitiesApi('').then(setResults);
              }
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Type any Indian city name (e.g. Jaipur, Lucknow, Ahmedabad, Bangalore)..."
            className="w-full py-4 pr-4 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
            aria-label="Search Indian city"
          />
          {isLoading && (
            <div className="pr-4 text-emerald-400 animate-spin">
              <Loader2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Quick Demo Pre-warmed Cities */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400">Instant Demo Cities:</span>
          <button
            type="button"
            onClick={() => onSelectCity('bangalore', 'Bangalore', true, 12.9716, 77.5946)}
            className="px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 font-medium"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Bangalore</span>
            <span className="text-[10px] bg-emerald-500/30 px-1 rounded font-bold">Instant</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCity('pune', 'Pune', true, 18.5204, 73.8567)}
            className="px-3 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 font-medium"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Pune</span>
            <span className="text-[10px] bg-cyan-500/30 px-1 rounded font-bold">Instant</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
            <div className="p-2.5 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Dynamic City Ingestion Engine</span>
              <span>7-Day Cache TTL</span>
            </div>

            {results.length === 0 && !isLoading && (
              <div className="p-4 text-center text-sm text-slate-400">
                {query ? `No cities found matching "${query}". Try another spelling.` : 'Type to search any city in India...'}
              </div>
            )}

            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.state && <span className="text-xs font-normal text-slate-400">{item.state}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-sm">{item.displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.isPreWarmed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Pre-warmed</span>
                    </span>
                  ) : item.isCached ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Cached (7d)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span>On-Demand Ingest</span>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Navbar variant: compact dropdown / autocomplete
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && results.length === 0) {
            searchCitiesApi('').then(setResults);
          }
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs transition-all shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-slate-100 font-extrabold max-w-[110px] sm:max-w-[140px] truncate">
          {getCityDisplayName(currentCityId)}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 z-50 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden divide-y divide-slate-800/80">
          {/* Search Input */}
          <div className="p-2.5 bg-slate-950/70 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any Indian city..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin shrink-0" />}
          </div>

          {/* Quick Pre-warmed Buttons */}
          <div className="p-2 bg-slate-950/40 flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 text-[10px] uppercase font-bold mr-1">Demo:</span>
            <button
              type="button"
              onClick={() => onSelectCity('bangalore', 'Bangalore', true, 12.9716, 77.5946)}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                currentCityId === 'bangalore'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Bangalore
            </button>
            <button
              type="button"
              onClick={() => onSelectCity('pune', 'Pune', true, 18.5204, 73.8567)}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                currentCityId === 'pune'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Pune
            </button>
          </div>

          {/* List of search results */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
            {results.length === 0 && !isLoading && (
              <div className="p-3 text-center text-xs text-slate-400">
                {query ? `No matching city found.` : 'Type to search any city...'}
              </div>
            )}

            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full px-3 py-2 text-left hover:bg-slate-800/80 transition-colors flex items-center justify-between ${
                  item.id === currentCityId ? 'bg-emerald-500/10' : ''
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{item.state || 'India'}</span>
                </div>

                <div className="shrink-0">
                  {item.isPreWarmed ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Instant
                    </span>
                  ) : item.isCached ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Cached
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Live Ingest
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
