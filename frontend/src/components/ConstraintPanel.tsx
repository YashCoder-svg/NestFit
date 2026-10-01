import React, { useState } from 'react';
import { CityId, FilterState, Workplace } from '../types';
import {
  Sliders,
  Car,
  Bus,
  BedDouble,
  RotateCcw,
  Sparkles,
  Scale,
  Building2,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Clock,
  Wind,
  Hospital,
  ShoppingBag
} from 'lucide-react';

interface ConstraintPanelProps {
  filters: FilterState;
  workplaces: Workplace[];
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

export const ConstraintPanel: React.FC<ConstraintPanelProps> = ({
  filters,
  workplaces,
  onFilterChange,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Count active hard filters
  const activeFiltersCount = [
    filters.maxRent !== undefined,
    filters.maxCommuteMinutes !== undefined,
    filters.maxAqi !== undefined,
    (filters.minHospitals || 0) > 0,
    (filters.minGroceries || 0) > 0
  ].filter(Boolean).length;

  return (
    <div className="bg-[#141B2D] rounded-xl p-5 border border-[#1F2937] space-y-5 shadow-card">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1F2937]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1A2332] border border-[#1F2937] flex items-center justify-center text-[#94A3B8]">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-[#E2E8F0] text-sm">Search Criteria</h2>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#64748B]">Non-dominated sorting parameters</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#94A3B8] hover:text-[#E2E8F0] bg-transparent hover:bg-[#1A2332] border border-[#1F2937] transition-colors"
          title="Reset to default criteria"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Workplace Selector & Quick Hub Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-medium text-[#E2E8F0] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Target Tech Campus</span>
          </label>
          <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A2332] border border-[#1F2937]">
            {filters.city}
          </span>
        </div>

        <div className="relative">
          <select
            value={filters.workplace.name}
            onChange={(e) => {
              const found = workplaces.find((w) => w.name === e.target.value);
              if (found) {
                onFilterChange({
                  workplace: { name: found.name, lat: found.centroid[1], lon: found.centroid[0] }
                });
              }
            }}
            className="w-full appearance-none bg-[#1A2332] border border-[#1F2937] rounded-lg px-3.5 py-2 text-xs text-[#E2E8F0] font-medium focus:outline-none focus:border-[#0D9488] transition-colors pr-8"
          >
            {workplaces.map((w) => (
              <option key={w.key} value={w.name}>
                {w.name} ({w.zone})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Quick Tech Park Chips */}
        {workplaces.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {workplaces.slice(0, 4).map((w) => {
              const isSelected = filters.workplace.name === w.name;
              return (
                <button
                  key={w.key}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      workplace: { name: w.name, lat: w.centroid[1], lon: w.centroid[0] }
                    })
                  }
                  className={`px-2 py-0.8 rounded text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/40'
                      : 'bg-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2332] border border-[#1F2937]'
                  }`}
                >
                  {w.name.split(' (')[0].replace('Rajiv Gandhi Infotech Park', 'Hinjawadi')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mode & Apartment Layout Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Transit Mode */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[#94A3B8]">Transit Mode</span>
          <div className="grid grid-cols-2 p-0.5 bg-[#0B1120] rounded-lg border border-[#1F2937] text-xs">
            <button
              type="button"
              onClick={() => onFilterChange({ transitMode: 'driving' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                filters.transitMode === 'driving'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ transitMode: 'transit' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                filters.transitMode === 'transit'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transit</span>
            </button>
          </div>
        </div>

        {/* Bedroom Layout */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[#94A3B8]">Unit Size</span>
          <div className="grid grid-cols-2 p-0.5 bg-[#0B1120] rounded-lg border border-[#1F2937] text-xs">
            <button
              type="button"
              onClick={() => onFilterChange({ bedroomType: '1bhk' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                filters.bedroomType === '1bhk'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <span>1 BHK</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ bedroomType: '2bhk' })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium transition-colors ${
                filters.bedroomType === '2bhk'
                  ? 'bg-[#1A2332] text-[#E2E8F0] border border-[#374151]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>2 BHK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optimization Model Switcher */}
      <div className="p-3.5 rounded-lg bg-[#0B1120]/60 border border-[#1F2937] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#E2E8F0] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Optimization Model</span>
          </span>
          <span className="text-[10px] text-[#64748B]">Deb O(MN²)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange({ algorithm: 'pareto' })}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              filters.algorithm === 'pareto'
                ? 'bg-[#0D9488]/10 border-[#0D9488]/40 text-[#E2E8F0]'
                : 'bg-[#141B2D] border-[#1F2937] text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <div className="text-[11px] font-semibold text-[#0D9488] mb-0.5">Pareto Frontier</div>
            <p className="text-[10px] text-[#64748B] leading-tight">
              Non-dominated trade-offs
            </p>
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ algorithm: 'weighted' })}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              filters.algorithm === 'weighted'
                ? 'bg-[#1A2332] border-[#374151] text-[#E2E8F0]'
                : 'bg-[#141B2D] border-[#1F2937] text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            <div className="text-[11px] font-semibold text-[#E2E8F0] mb-0.5 flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#94A3B8]" />
              <span>Weighted Sum</span>
            </div>
            <p className="text-[10px] text-[#64748B] leading-tight">
              0-100 composite score
            </p>
          </button>
        </div>
      </div>

      {/* Hard Constraints Section */}
      <div className="pt-2 border-t border-[#1F2937] space-y-3.5">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-[#64748B] hover:text-[#94A3B8] transition-colors py-1"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[11px]">HARD CONSTRAINTS</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="space-y-3.5 pt-1">
            {/* Max Rent */}
            <div className="space-y-1.5 p-3 rounded-lg bg-[#0B1120]/50 border border-[#1F2937]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-[#64748B]" />
                  <span>Max Monthly Rent</span>
                </span>
                <span className="font-semibold text-[#E2E8F0] font-mono text-xs">
                  {filters.maxRent ? `₹${filters.maxRent.toLocaleString('en-IN')}` : 'No Limit'}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="45000"
                step="1000"
                value={filters.maxRent || 45000}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onFilterChange({ maxRent: val >= 45000 ? undefined : val });
                }}
                className="w-full"
              />
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <span className="text-[10px] text-[#64748B]">₹10k</span>
                <div className="flex gap-1">
                  {[20000, 30000, 40000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => onFilterChange({ maxRent: amt })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        filters.maxRent === amt
                          ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                          : 'bg-[#141B2D] text-[#64748B] hover:text-[#94A3B8] border border-[#1F2937]'
                      }`}
                    >
                      ≤₹{amt / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onFilterChange({ maxRent: undefined })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      filters.maxRent === undefined
                        ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                        : 'bg-[#141B2D] text-[#64748B] hover:text-[#94A3B8] border border-[#1F2937]'
                    }`}
                  >
                    Any
                  </button>
                </div>
                <span className="text-[10px] text-[#64748B]">No Limit</span>
              </div>
            </div>

            {/* Max Commute */}
            <div className="space-y-1.5 p-3 rounded-lg bg-[#0B1120]/50 border border-[#1F2937]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#64748B]" />
                  <span>Max Commute Time</span>
                </span>
                <span className="font-semibold text-[#E2E8F0] font-mono text-xs">
                  {filters.maxCommuteMinutes ? `${filters.maxCommuteMinutes} mins` : 'No Limit'}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                step="5"
                value={filters.maxCommuteMinutes || 65}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onFilterChange({ maxCommuteMinutes: val >= 65 ? undefined : val });
                }}
                className="w-full"
              />
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <span className="text-[10px] text-[#64748B]">15m</span>
                <div className="flex gap-1">
                  {[25, 35, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onFilterChange({ maxCommuteMinutes: mins })}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        filters.maxCommuteMinutes === mins
                          ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                          : 'bg-[#141B2D] text-[#64748B] hover:text-[#94A3B8] border border-[#1F2937]'
                      }`}
                    >
                      ≤{mins}m
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onFilterChange({ maxCommuteMinutes: undefined })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      filters.maxCommuteMinutes === undefined
                        ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                        : 'bg-[#141B2D] text-[#64748B] hover:text-[#94A3B8] border border-[#1F2937]'
                    }`}
                  >
                    Any
                  </button>
                </div>
                <span className="text-[10px] text-[#64748B]">No Limit</span>
              </div>
            </div>

            {/* Max AQI */}
            <div className="space-y-1.5 p-3 rounded-lg bg-[#0B1120]/50 border border-[#1F2937]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[#64748B]" />
                  <span>Max Air Quality (AQI)</span>
                </span>
                <span className="font-semibold text-[#E2E8F0] font-mono text-xs">
                  {filters.maxAqi ? `≤ ${filters.maxAqi}` : 'No Limit'}
                </span>
              </div>
              <input
                type="range"
                min="45"
                max="120"
                step="5"
                value={filters.maxAqi || 120}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onFilterChange({ maxAqi: val >= 120 ? undefined : val });
                }}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] pt-0.5">
                <span>Clean (45)</span>
                <span>Moderate (80)</span>
                <span>No Limit</span>
              </div>
            </div>

            {/* Min Facilities: Hospitals & Groceries in 2 columns */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Min Hospitals */}
              <div className="p-2.5 rounded-lg bg-[#0B1120]/50 border border-[#1F2937] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8] text-[11px]">Hospitals</span>
                  <span className="font-semibold text-[#E2E8F0] text-[11px] font-mono">
                    {filters.minHospitals ? `${filters.minHospitals}+` : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="16"
                  step="1"
                  value={filters.minHospitals || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onFilterChange({ minHospitals: val <= 0 ? undefined : val });
                  }}
                  className="w-full"
                />
              </div>

              {/* Min Groceries */}
              <div className="p-2.5 rounded-lg bg-[#0B1120]/50 border border-[#1F2937] space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8] text-[11px]">Groceries</span>
                  <span className="font-semibold text-[#E2E8F0] text-[11px] font-mono">
                    {filters.minGroceries ? `${filters.minGroceries}+` : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="2"
                  value={filters.minGroceries || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onFilterChange({ minGroceries: val <= 0 ? undefined : val });
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
