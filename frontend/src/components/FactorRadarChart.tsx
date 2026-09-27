import React from 'react';
import { RadarScores } from '../types';

interface FactorRadarChartProps {
  scores: RadarScores;
  size?: number;
  showLabels?: boolean;
}

export const FactorRadarChart: React.FC<FactorRadarChartProps> = ({
  scores,
  size = 180,
  showLabels = true
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  const axes = [
    { key: 'affordability', label: 'Affordability', value: scores.affordability },
    { key: 'commuteConvenience', label: 'Commute', value: scores.commuteConvenience },
    { key: 'airQuality', label: 'Air Quality', value: scores.airQuality },
    { key: 'healthcareAccess', label: 'Healthcare', value: scores.healthcareAccess },
    { key: 'dailyNeeds', label: 'Groceries', value: scores.dailyNeeds },
  ];

  const totalAxes = axes.length;
  const angleStep = (Math.PI * 2) / totalAxes;
  const startAngle = -Math.PI / 2; // top center

  // Compute point for a given axis index and normalized value (0-100)
  const getCoordinates = (index: number, val: number) => {
    const angle = startAngle + index * angleStep;
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Background grid levels (25%, 50%, 75%, 100%)
  const levels = [25, 50, 75, 100];

  // Polygon points for data
  const dataPoints = axes.map((a, i) => getCoordinates(i, a.value));
  const polygonPointsStr = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Circular / Polygonal Grid Web */}
        {levels.map((lvl) => {
          const gridPoints = axes.map((_, i) => getCoordinates(i, lvl));
          const gridStr = gridPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
          return (
            <polygon
              key={lvl}
              points={gridStr}
              fill="none"
              stroke="#334155"
              strokeWidth="0.8"
              strokeDasharray={lvl === 100 ? undefined : '2,2'}
            />
          );
        })}

        {/* Axis Lines */}
        {axes.map((_, i) => {
          const end = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#334155"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Data Area Polygon */}
        <polygon
          points={polygonPointsStr}
          fill="url(#radarGradient)"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Data Point Dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            className="fill-emerald-400 stroke-slate-950 stroke-2"
          />
        ))}

        {/* Axis Labels */}
        {showLabels &&
          axes.map((a, i) => {
            const labelCoord = getCoordinates(i, 118);
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (labelCoord.x > center + 10) textAnchor = 'start';
            else if (labelCoord.x < center - 10) textAnchor = 'end';

            return (
              <text
                key={a.key}
                x={labelCoord.x}
                y={labelCoord.y + 3}
                textAnchor={textAnchor}
                className="text-[9px] font-semibold fill-slate-400 select-none"
              >
                {a.label} ({Math.round(a.value)})
              </text>
            );
          })}
      </svg>
    </div>
  );
};
