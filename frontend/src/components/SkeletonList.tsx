import React from 'react';

export const SkeletonList: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="surface-card rounded-xl p-4 border border-[#1F2937] animate-pulse space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-[#1F2937] rounded" />
              <div className="h-3 w-24 bg-[#1F2937]/60 rounded" />
            </div>
            <div className="h-5 w-24 bg-[#0D9488]/10 rounded-full border border-[#0D9488]/20" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-12 bg-[#1A2332] rounded-lg border border-[#1F2937]/50" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
