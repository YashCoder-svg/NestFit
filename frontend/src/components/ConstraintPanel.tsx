import React from 'react';
import { CityId, FilterState, Workplace } from '../types';
import { Sliders, Car, Bus, BedDouble, RotateCcw, Sparkles, Scale, Building2, MapPin } from 'lucide-react';

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
  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-100 text-base">Live Constraints</h2>
            <p className="text-[11px] text-slate-400">Instant debounced recalculation</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Workplace Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Tech Park / Workplace</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider capitalize">
            {filters.city}
          </span>
        </label>
        <select
          value={filters.workplace.name}
          onChange={(e) => {
            const found = workplaces.find(w => w.name === e.target.value);
            if (found) {
              onFilterChange({
                workplace: { name: found.name, lat: found.centroid[1], lon: found.centroid[0] }
              });
            }
          }}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
        >
          {workplaces.map(w => (
            <option key={w.key} value={w.name}>
              {w.name} ({w.zone})
            </option>
          ))}
        </select>
      </div>

      {/* Mode & Apartment Layout Toggles */}
      <div className="grid grid-cols-2 gap-3">
        {/* Commute Mode */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300">Transit Mode</span>
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => onFilterChange({ transitMode: 'driving' })}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                filters.transitMode === 'driving'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
            <button
              onClick={() => onFilterChange({ transitMode: 'transit' })}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                filters.transitMode === 'transit'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transit</span>
            </button>
          </div>
        </div>

        {/* Bedroom Layout */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300">Apartment Size</span>
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => onFilterChange({ bedroomType: '1bhk' })}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                filters.bedroomType === '1bhk'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>1 BHK</span>
            </button>
            <button
              onClick={() => onFilterChange({ bedroomType: '2bhk' })}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                filters.bedroomType === '2bhk'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>2 BHK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Mode Switcher */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Optimization Model</span>
          </span>
          <span className="text-[10px] text-slate-400">Trade-off Comparison</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onFilterChange({ algorithm: 'pareto' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              filters.algorithm === 'pareto'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[12px] font-extrabold mb-0.5">★ Pareto Frontier</div>
            <p className="text-[10px] text-slate-400 font-normal">Non-dominated sorting</p>
          </button>

          <button
            onClick={() => onFilterChange({ algorithm: 'weighted' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              filters.algorithm === 'weighted'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-[12px] font-extrabold mb-0.5 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>Weighted Sum</span>
            </div>
            <p className="text-[10px] text-slate-400 font-normal">Linear composite model</p>
          </button>
        </div>
      </div>

      {/* Sliders for Hard Constraints */}
      <div className="space-y-5 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Hard Constraints (Pre-Filters)
        </h3>

        {/* Max Rent */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Max Monthly Rent</span>
            <span className="font-extrabold text-emerald-400">
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
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>₹10,000</span>
            <span>₹25,000</span>
            <span>No Limit</span>
          </div>
        </div>

        {/* Max Commute */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Max Commute Time</span>
            <span className="font-extrabold text-cyan-400">
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
            className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>15m</span>
            <span>35m</span>
            <span>No Limit</span>
          </div>
        </div>

        {/* Max AQI */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Max Acceptable AQI</span>
            <span className="font-extrabold text-teal-400">
              {filters.maxAqi ? `AQI ≤ ${filters.maxAqi}` : 'No Limit'}
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
            className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Clean (45)</span>
            <span>Moderate (80)</span>
            <span>No Limit</span>
          </div>
        </div>

        {/* Min Hospitals */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Min Hospitals & Clinics</span>
            <span className="font-extrabold text-slate-200">
              {filters.minHospitals ? `${filters.minHospitals}+ nearby` : 'Any'}
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
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Min Groceries */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Min Grocery & Supermarkets</span>
            <span className="font-extrabold text-slate-200">
              {filters.minGroceries ? `${filters.minGroceries}+ nearby` : 'Any'}
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
            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
