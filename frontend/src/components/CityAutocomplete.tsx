import React, { useState, useEffect, useRef } from 'react';
import { CitySearchResult } from '../types';
import { searchCitiesApi } from '../services/api';
import { MapPin, Search, Loader2 } from 'lucide-react';

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
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Typewriter effect rotating through example cities in hero search input
  const [typewriterCity, setTypewriterCity] = useState('Bangalore');
  useEffect(() => {
    if (variant !== 'hero') return;

    const cities = ['Bangalore', 'Jaipur', 'Lucknow', 'Raigarh'];
    let cityIdx = 0;
    let charIdx = cities[0].length;
    let isDeleting = true;
    let timer: ReturnType<typeof setTimeout>;

    // Initial pause on the first city before starting rotation
    timer = setTimeout(() => {
      const step = () => {
        const current = cities[cityIdx];
        if (isDeleting) {
          charIdx--;
          setTypewriterCity(current.substring(0, charIdx));
          if (charIdx <= 0) {
            isDeleting = false;
            cityIdx = (cityIdx + 1) % cities.length;
            timer = setTimeout(step, 350);
            return;
          }
          timer = setTimeout(step, 45);
        } else {
          charIdx++;
          setTypewriterCity(current.substring(0, charIdx));
          if (charIdx >= current.length) {
            isDeleting = true;
            timer = setTimeout(step, 2000);
            return;
          }
          timer = setTimeout(step, 80);
        }
      };
      step();
    }, 1800);

    return () => clearTimeout(timer);
  }, [variant]);

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
      <div ref={containerRef} className={`relative w-full max-w-xl mx-auto ${className}`}>
        {/* Search Input Box */}
        <div className="relative flex items-center rounded-lg bg-[#141B2D] border border-[#1F2937] focus-within:border-[#0D9488] transition-colors shadow-card">
          <div className="pl-3.5 pr-2 text-[#64748B]">
            <Search className="w-4 h-4" />
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
            placeholder={`Search Indian city (e.g. "${typewriterCity}")...`}
            className="w-full py-3 pr-4 bg-transparent text-xs sm:text-sm text-[#E2E8F0] placeholder-[#64748B] focus:outline-none"
            aria-label="Search Indian city"
          />
          {isLoading && (
            <div className="pr-3.5 text-[#0D9488] animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Quick Demo Pre-warmed Cities */}
        <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-[#64748B] text-[11px]">Instant Datasets:</span>
          <button
            type="button"
            onClick={() => onSelectCity('bangalore', 'Bangalore', true, 12.9716, 77.5946)}
            className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] transition-colors flex items-center gap-1.5"
          >
            <span>Bangalore</span>
            <span className="text-[10px] text-[#0D9488] font-mono">20 sectors</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCity('pune', 'Pune', true, 18.5204, 73.8567)}
            className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#141B2D] hover:bg-[#1A2332] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937] transition-colors flex items-center gap-1.5"
          >
            <span>Pune</span>
            <span className="text-[10px] text-[#0D9488] font-mono">16 sectors</span>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg bg-[#1A2332] border border-[#1F2937] shadow-modal overflow-hidden divide-y divide-[#1F2937] max-h-80 overflow-y-auto">
            <div className="px-3.5 py-2 bg-[#141B2D] text-[10px] font-mono text-[#64748B] uppercase tracking-wider flex items-center justify-between">
              <span>City Ingestion Pipeline</span>
              <span>7-Day Cache TTL</span>
            </div>

            {results.length === 0 && !isLoading && (
              <div className="p-4 text-center text-xs text-[#94A3B8]">
                {query ? `No cities found matching "${query}".` : 'Type to search any city in India...'}
              </div>
            )}

            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#141B2D] transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-[#141B2D] text-[#94A3B8] border border-[#1F2937]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#E2E8F0] flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.state && <span className="text-[11px] text-[#64748B]">({item.state})</span>}
                    </div>
                    <p className="text-[10px] text-[#64748B] truncate max-w-sm">{item.displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.isPreWarmed ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                      Pre-warmed
                    </span>
                  ) : item.isCached ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#475569]/15 text-[#94A3B8] border border-[#475569]/30">
                      Cached
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30">
                      On-Demand
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

  // Navbar variant: compact dropdown
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && results.length === 0) {
            searchCitiesApi('').then(setResults);
          }
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141B2D] border border-[#1F2937] hover:border-[#374151] cursor-pointer text-xs transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
        <span className="text-[#E2E8F0] font-medium max-w-[110px] sm:max-w-[140px] truncate">
          {getCityDisplayName(currentCityId)}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-88 z-50 rounded-lg bg-[#1A2332] border border-[#1F2937] shadow-modal overflow-hidden divide-y divide-[#1F2937]">
          {/* Search Input */}
          <div className="p-2.5 bg-[#141B2D] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Indian city..."
              className="w-full bg-transparent text-xs text-[#E2E8F0] placeholder-[#64748B] focus:outline-none"
              autoFocus
            />
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-[#0D9488] animate-spin shrink-0" />}
          </div>

          {/* Quick Pre-warmed Buttons */}
          <div className="p-2 bg-[#141B2D]/50 flex items-center gap-1.5 text-[11px]">
            <span className="text-[#64748B] text-[10px] uppercase font-mono mr-1">Pre-warmed:</span>
            <button
              type="button"
              onClick={() => onSelectCity('bangalore', 'Bangalore', true, 12.9716, 77.5946)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                currentCityId === 'bangalore'
                  ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                  : 'bg-[#141B2D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937]'
              }`}
            >
              Bangalore
            </button>
            <button
              type="button"
              onClick={() => onSelectCity('pune', 'Pune', true, 18.5204, 73.8567)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                currentCityId === 'pune'
                  ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                  : 'bg-[#141B2D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#1F2937]'
              }`}
            >
              Pune
            </button>
          </div>

          {/* List of search results */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#1F2937]">
            {results.length === 0 && !isLoading && (
              <div className="p-3 text-center text-xs text-[#94A3B8]">
                {query ? `No matching city found.` : 'Type to search any city...'}
              </div>
            )}

            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className={`w-full px-3 py-2 text-left hover:bg-[#141B2D] transition-colors flex items-center justify-between ${
                  item.id === currentCityId ? 'bg-[#0D9488]/10' : ''
                }`}
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-medium text-[#E2E8F0] block truncate">{item.name}</span>
                  <span className="text-[10px] text-[#64748B] block truncate">{item.state || 'India'}</span>
                </div>

                <div className="shrink-0">
                  {item.isPreWarmed ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                      Pre-warmed
                    </span>
                  ) : item.isCached ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#475569]/15 text-[#94A3B8] border border-[#475569]/30">
                      Cached
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#D97706]/15 text-[#D97706] border border-[#D97706]/30">
                      On-Demand
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
