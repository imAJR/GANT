/**
 * GANT — Welcome Splash Screen
 * Desktop professional entry screen for GANT - Interactive Project Planning Simulator.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React from 'react';
import { Play, Sparkles, Award, BookOpen, Layers } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { GanttLogo } from '../common/GanttLogo';

export const WelcomeScreen: React.FC = () => {
  const { profile, setAppScreen } = useProject();

  const handleStart = () => {
    if (profile.studentName && profile.studentName.trim().length > 0) {
      setAppScreen('stage_select');
    } else {
      setAppScreen('name_input');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#E4E7EB] text-[#1E293B] p-4 select-none relative overflow-hidden font-sans">
      {/* Authentic Desktop Window Frame */}
      <div className="relative z-10 max-w-lg w-full bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl flex flex-col overflow-hidden text-[12px]">
        {/* Desktop Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <span className="font-mono font-extrabold text-[#2563EB]">GANT</span>
            <span>— محاكي تخطيط المشروعات (GanttProject Simulator 2026)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#CBD5E1]" />
            <div className="w-3 h-3 rounded-full bg-[#CBD5E1]" />
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6 bg-white flex flex-col items-center text-center space-y-4">
          {/* Logo Lockup */}
          <div className="py-2">
            <GanttLogo size="lg" />
          </div>

          {/* Branding Title */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <span className="text-2xl font-extrabold text-[#0F172A] font-mono tracking-tight">GANT</span>
              <span className="text-xl font-bold text-[#2563EB]">جانت</span>
            </div>
            <p className="text-[11px] font-semibold text-[#64748B] tracking-wide">
              Interactive Project Planning Simulator
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-[#334155] leading-relaxed max-w-md">
            محاكي تعليمي أصلي لتخطيط وإدارة المشروعات، مستند إلى مقرر{' '}
            <strong className="text-[#0F172A]">التقنية الرقمية 3</strong>{' '}
            (الوحدة الأولى: تخطيط المشروعات)، عبر سيناريو{' '}
            <strong className="text-[#2563EB]">مشروع المسرحية المدرسية</strong>.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 w-full flex justify-center">
            <button
              onClick={handleStart}
              className="px-8 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer border border-[#1D4ED8]"
            >
              <span>ابدأ استخدام المحاكي</span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>

          {/* Metadata info */}
          <div className="pt-4 border-t border-[#E2E8F0] w-full flex items-center justify-between text-[11px] text-[#64748B]">
            <div className="flex items-center gap-1">
              <span>تصميم:</span>
              <strong className="text-[#0F172A]">علي بن حامد الجبرتي</strong>
            </div>
            <div>
              2026م · المسرحية المدرسية
            </div>
          </div>
        </div>

        {/* Desktop Status Bar */}
        <div className="px-3 py-1 bg-[#E2E6EA] border-t border-[#CBD5E1] text-[10px] text-[#64748B] flex items-center justify-between select-none">
          <span>الإصدار التعليمي المكتبي 2026</span>
          <span>جاهز لبدء الجلسة</span>
        </div>
      </div>
    </div>
  );
};
