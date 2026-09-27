import React from 'react';

export const SkeletonList: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="glass-panel rounded-2xl p-5 border border-slate-800 animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-36 bg-slate-800 rounded-lg" />
              <div className="h-3 w-24 bg-slate-800/60 rounded" />
            </div>
            <div className="h-6 w-28 bg-emerald-500/10 rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-14 bg-slate-900/80 rounded-xl border border-slate-800/60" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
