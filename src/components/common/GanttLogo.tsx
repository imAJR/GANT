/**
 * GANT — Professional Geometric Desktop Logo
 * Represents project planning, tasks, WBS hierarchy, and scheduling timeline.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React from 'react';

interface GanttLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GanttLogo: React.FC<GanttLogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className={`${dimensions} bg-[#2563EB] border border-[#1D4ED8] rounded-xs shadow-xs flex flex-col justify-center p-1 shrink-0`}>
        {/* Gantt Timeline Bars Graphic */}
        <div className="w-full flex items-center justify-between">
          <div className="w-3.5 h-1 bg-white rounded-2xs" />
          <div className="w-1.5 h-1 bg-blue-200 rounded-2xs" />
        </div>
        <div className="w-full flex items-center justify-between my-0.5">
          <div className="w-2 h-1 bg-blue-200 rounded-2xs" />
          <div className="w-4 h-1 bg-white rounded-2xs" />
        </div>
        <div className="w-full flex items-center justify-between">
          <div className="w-3 h-1 bg-white rounded-2xs" />
          <div className="w-2 h-1 bg-amber-300 rounded-2xs" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-mono font-extrabold text-[#0F172A] tracking-tight text-sm">GANT</span>
          <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-1 rounded font-mono">2026</span>
        </div>
        <span className="text-[9px] text-[#64748B] font-semibold">Project Simulator</span>
      </div>
    </div>
  );
};
