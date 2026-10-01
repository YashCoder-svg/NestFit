import React from 'react';
import { RankedNeighborhood } from '../types';
import { X, Scale, IndianRupee, Clock, Wind, Hospital, ShoppingBag, Train, Trash2 } from 'lucide-react';

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

  const validRents = areas.map((a) => a.rent).filter((r): r is number => r !== null);
  const minRent = validRents.length > 0 ? Math.min(...validRents) : null;
  const minCommute = Math.min(...areas.map((a) => a.commuteMinutes));
  const bestAqi = Math.min(...areas.map((a) => a.aqi));
  const maxHosp = Math.max(...areas.map((a) => a.hospitalCount));
  const maxGroc = Math.max(...areas.map((a) => a.groceryCount));

  // Multi-radar parameters (muted colors)
  const size = 240;
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const axes = ['Affordability', 'Commute', 'Air Quality', 'Healthcare', 'Groceries'];
  const colors = ['#0D9488', '#475569', '#6B5B95']; // Muted Front colors

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[#0B1120]/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#1A2332] border border-[#1F2937] rounded-xl p-6 sm:p-7 shadow-modal z-10 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1F2937]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#141B2D] border border-[#1F2937] flex items-center justify-center text-[#0D9488]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#E2E8F0]">
                Side-by-Side Trade-off Comparison
              </h2>
              <p className="text-xs text-[#64748B]">
                Evaluating {areas.length} {areas.length === 1 ? 'micro-market' : 'micro-markets'} across Pareto criteria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#94A3B8] hover:text-rose-400 bg-[#141B2D] hover:bg-[#253043] border border-[#1F2937] rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] bg-[#141B2D] hover:bg-[#253043] border border-[#1F2937] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side-by-side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {areas.map((area, idx) => {
            const color = colors[idx % colors.length];
            const isBestRent = area.rent !== null && minRent !== null && area.rent === minRent;
            const isBestCommute = area.commuteMinutes === minCommute;
            const isBestAir = area.aqi === bestAqi;

            return (
              <div
                key={area.key}
                className="p-4 rounded-lg bg-[#141B2D] border border-[#1F2937] relative space-y-3.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="font-semibold text-sm text-[#E2E8F0]">{area.name}</h3>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{area.zone}</p>
                  </div>
                  <button
                    onClick={() => onRemoveArea(area.key)}
                    className="text-[#64748B] hover:text-rose-400 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Rent */}
                  <div className="flex justify-between items-center p-2 rounded bg-[#0B1120] border border-[#1F2937]">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-[#64748B]" />
                      <span>Rent</span>
                    </span>
                    <div className="text-right">
                      <strong className="font-mono text-[#E2E8F0] block">
                        {area.rent ? `₹${area.rent.toLocaleString('en-IN')}` : 'Unsurveyed'}
                      </strong>
                      {isBestRent && (
                        <span className="text-[10px] text-[#0D9488]">Best in set</span>
                      )}
                    </div>
                  </div>

                  {/* Commute */}
                  <div className="flex justify-between items-center p-2 rounded bg-[#0B1120] border border-[#1F2937]">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#64748B]" />
                      <span>Commute</span>
                    </span>
                    <div className="text-right">
                      <strong className="font-mono text-[#E2E8F0] block">
                        {Math.round(area.commuteMinutes)} mins
                      </strong>
                      {isBestCommute && (
                        <span className="text-[10px] text-[#0D9488]">Shortest</span>
                      )}
                    </div>
                  </div>

                  {/* AQI */}
                  <div className="flex justify-between items-center p-2 rounded bg-[#0B1120] border border-[#1F2937]">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#64748B]" />
                      <span>Air (AQI)</span>
                    </span>
                    <div className="text-right">
                      <strong className="font-mono text-[#E2E8F0] block">
                        {Math.round(area.aqi)}
                      </strong>
                      {isBestAir && (
                        <span className="text-[10px] text-[#0D9488]">Cleanest</span>
                      )}
                    </div>
                  </div>

                  {/* Hospitals & Groceries */}
                  <div className="flex justify-between items-center p-2 rounded bg-[#0B1120] border border-[#1F2937]">
                    <span className="text-[#94A3B8] flex items-center gap-1">
                      <Hospital className="w-3 h-3 text-[#64748B]" />
                      <span>Facilities</span>
                    </span>
                    <div className="text-right font-mono text-[11px] text-[#E2E8F0]">
                      <span>{area.hospitalCount}H • {area.groceryCount}G</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-radar Overlay */}
        <div className="p-4 rounded-lg bg-[#141B2D] border border-[#1F2937] flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-[#64748B] mb-2 font-medium">
            <span>Criteria Overlay Profile</span>
            <div className="flex items-center gap-3">
              {areas.map((a, i) => (
                <div key={a.key} className="flex items-center gap-1 text-[11px] text-[#E2E8F0]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <svg width={size} height={size} className="overflow-visible">
              {[25, 50, 75].map((lvl) => (
                <circle
                  key={lvl}
                  cx={center}
                  cy={center}
                  r={(lvl / 100) * radius}
                  fill="none"
                  stroke="#1F2937"
                  strokeWidth="1"
                />
              ))}

              {axes.map((label, i) => {
                const pt = getCoordinates(i, 100);
                const textPt = getCoordinates(i, 118);
                return (
                  <g key={i}>
                    <line x1={center} y1={center} x2={pt.x} y2={pt.y} stroke="#1F2937" strokeWidth="1" />
                    <text
                      x={textPt.x}
                      y={textPt.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[10px] fill-[#64748B]"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {areas.map((area, idx) => {
                const color = colors[idx % colors.length];
                const scores = [
                  area.radarScores?.affordability ?? 70,
                  area.radarScores?.commuteConvenience ?? 75,
                  area.radarScores?.airQuality ?? 65,
                  area.radarScores?.healthcareAccess ?? 80,
                  area.radarScores?.dailyNeeds ?? 85
                ];
                const points = scores.map((val, i) => getCoordinates(i, val));
                const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

                return (
                  <polygon
                    key={area.key}
                    points={pointsStr}
                    fill={color}
                    fillOpacity="0.14"
                    stroke={color}
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
