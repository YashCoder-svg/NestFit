import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RankedNeighborhood } from '../types';
import { X, Scale, IndianRupee, Clock, Wind, Hospital, ShoppingBag, Train, Trash2, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  areas: RankedNeighborhood[];
  onRemoveArea: (key: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  areas,
  onRemoveArea,
  onClear,
  onClose
}) => {
  if (!isOpen || areas.length === 0) return null;

  const validRents = areas.map(a => a.rent).filter((r): r is number => r !== null);
  const minRent = validRents.length > 0 ? Math.min(...validRents) : null;
  const minCommute = Math.min(...areas.map(a => a.commuteMinutes));
  const bestAqi = Math.min(...areas.map(a => a.aqi));
  const maxHosp = Math.max(...areas.map(a => a.hospitalCount));
  const maxGroc = Math.max(...areas.map(a => a.groceryCount));


  // Multi-radar SVG parameters
  const size = 260;
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const axes = ['Affordability', 'Commute', 'Air Quality', 'Healthcare', 'Groceries'];
  const colors = ['#10b981', '#06b6d4', '#f59e0b']; // emerald, cyan, amber

  const getCoordinates = (index: number, val: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[92vh] overflow-y-auto"
      >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Side-by-Side Trade-off Comparison
                </h2>
                <p className="text-xs text-slate-400">
                  Comparing {areas.length} {areas.length === 1 ? 'neighborhood' : 'neighborhoods'} directly across Pareto dimensions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side-by-side Cards & Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {areas.map((area, idx) => {
              const color = colors[idx % colors.length];
              const isBestRent = area.rent !== null && minRent !== null && area.rent === minRent;
              const isBestCommute = area.commuteMinutes === minCommute;
              const isBestAir = area.aqi === bestAqi;

              return (
                <div
                  key={area.key}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 relative space-y-4"
                  style={{ borderTop: `3px solid ${color}` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color }}>
                        Candidate {idx + 1}
                      </span>
                      <h3 className="text-base font-extrabold text-white">{area.name}</h3>
                      <p className="text-xs text-slate-400">{area.zone}</p>
                    </div>
                    <button
                      onClick={() => onRemoveArea(area.key)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Factor Rows */}
                  <div className="space-y-2.5 text-xs">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isBestRent ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Rent</span>
                      </div>
                      <div className="text-right">
                        {area.rent !== null ? (
                          <>
                            <strong className="text-slate-100">₹{area.rent.toLocaleString('en-IN')}</strong>
                            {minRent !== null && area.rent > minRent && (
                              <div className="text-[10px] text-amber-400">
                                +₹{(area.rent - minRent).toLocaleString('en-IN')}/mo
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-amber-300 font-semibold">Not available</span>
                        )}
                      </div>
                    </div>


                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isBestCommute ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Commute</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-slate-100">{Math.round(area.commuteMinutes)} mins</strong>
                        {area.commuteMinutes > minCommute && (
                          <div className="text-[10px] text-amber-400">
                            +{Math.round(area.commuteMinutes - minCommute)}m slower
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isBestAir ? 'bg-teal-500/10 border-teal-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Wind className="w-3.5 h-3.5 text-teal-400" />
                        <span>AQI</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-slate-100">{Math.round(area.aqi)}</strong>
                        <span className="text-[10px] text-slate-400 ml-1">
                          {area.aqi <= 60 ? 'Good' : 'Moderate'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Hospital className="w-3.5 h-3.5 text-purple-400" />
                        <span>Hospitals</span>
                      </div>
                      <strong className="text-slate-100">{area.hospitalCount} centers</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Groceries</span>
                      </div>
                      <strong className="text-slate-100">{area.groceryCount} stores</strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Train className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Metro</span>
                      </div>
                      <span className={`text-[11px] font-semibold ${area.metroConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {area.metroConnected ? 'Direct Access' : 'Bus / Cab'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Multi-Polygon Overlaid Radar Chart */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Superimposed Multi-Objective Radar Overlay
            </h4>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold mb-4">
              {areas.map((a, i) => (
                <div key={a.key} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-slate-200">{a.name}</span>
                </div>
              ))}
            </div>

            <svg width={size} height={size} className="overflow-visible">
              {/* Web circles */}
              {[25, 50, 75, 100].map(lvl => {
                const points = axes.map((_, i) => getCoordinates(i, lvl));
                return (
                  <polygon
                    key={lvl}
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.8"
                    strokeDasharray={lvl === 100 ? undefined : '2,2'}
                  />
                );
              })}

              {/* Axis lines */}
              {axes.map((_, i) => {
                const end = getCoordinates(i, 100);
                return <line key={i} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#334155" strokeWidth="0.8" />;
              })}

              {/* Overlay areas */}
              {areas.map((area, idx) => {
                const scores = [
                  area.radarScores.affordability,
                  area.radarScores.commuteConvenience,
                  area.radarScores.airQuality,
                  area.radarScores.healthcareAccess,
                  area.radarScores.dailyNeeds
                ];
                const points = scores.map((s, i) => getCoordinates(i, s));
                const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
                const color = colors[idx % colors.length];

                return (
                  <g key={area.key}>
                    <polygon
                      points={pointsStr}
                      fill={color}
                      fillOpacity="0.2"
                      stroke={color}
                      strokeWidth="2.5"
                    />
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#020617" strokeWidth="1.5" />
                    ))}
                  </g>
                );
              })}

              {/* Labels */}
              {axes.map((label, i) => {
                const labelCoord = getCoordinates(i, 118);
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                if (labelCoord.x > center + 10) textAnchor = 'start';
                else if (labelCoord.x < center - 10) textAnchor = 'end';

                return (
                  <text
                    key={label}
                    x={labelCoord.x}
                    y={labelCoord.y + 3}
                    textAnchor={textAnchor}
                    className="text-[10px] font-bold fill-slate-300 select-none"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
  );
};
