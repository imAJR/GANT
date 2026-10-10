/**
 * GANT — Authentic Desktop About Dialog
 * Official documentation and authorship details.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React from 'react';
import { X, Award, BookOpen, User, Calendar, Check } from 'lucide-react';
import { getMascotAsset } from '../assistant/GanttBeeAssistant';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const beeMascotImg = getMascotAsset('idle');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Desktop Window Frame */}
      <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-md flex flex-col text-[#1E293B] text-[12px] overflow-hidden">
        {/* Desktop Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <Award className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>حول البرنامج (About GANT Simulator)</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
            title="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 bg-white space-y-4">
          {/* Header Lockup */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
            <div className="w-14 h-14 rounded-xl border border-[#CBD5E1] bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F6] p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <img
                src={beeMascotImg}
                alt="نحلة جانت"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-extrabold text-[#0F172A] font-mono tracking-tight">GANT</h3>
                <span className="text-base font-bold text-[#2563EB]">جانت</span>
              </div>
              <p className="text-[11px] text-[#64748B] font-semibold">
                Interactive Project Planning Simulator
              </p>
              <span className="inline-block mt-0.5 text-[10px] bg-[#E2E8F0] text-[#334155] px-1.5 py-0.2 rounded font-mono font-bold">
                الإصدار التعليمي المكتبي 2026
              </span>
            </div>
          </div>

          {/* Core Product Info */}
          <div className="space-y-2 text-xs text-[#334155] leading-relaxed">
            <p>
              محاكي تعليمي أصلي لتخطيط وإدارة المشروعات، مستند إلى مقرر{' '}
              <strong className="text-[#0F172A]">التقنية الرقمية 3</strong> (الوحدة الأولى: تخطيط المشروعات)، عبر سيناريو{' '}
              <strong className="text-[#2563EB]">مشروع المسرحية المدرسية</strong>.
            </p>
          </div>

          {/* Metadata Cards */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded p-3 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>المالك والمصمم:</span>
              </span>
              <strong className="text-[#0F172A]">علي بن حامد الجبرتي — Ali bin Hamed Al-Jabarti</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>سنة الإنتاج:</span>
              </span>
              <span className="font-mono font-bold text-[#0F172A]">2026م</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>المرجع المنهجي:</span>
              </span>
              <span className="text-[#0F172A]">التقنية الرقمية 3 · المسرحية المدرسية</span>
            </div>
          </div>

          <p className="text-[10px] text-[#64748B] text-center">
            GANT محاكي تعليمي مستقل مستوحى من أدوات إدارة المشاريع ومقرر وزارة التعليم، ولا يدّعي الارتباط الرسمي ببرنامج GanttProject.
          </p>
        </div>

        {/* Desktop Bottom Action Button Bar */}
        <div className="px-3 py-2 bg-[#E2E6EA] border-t border-[#CBD5E1] flex items-center justify-end select-none">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8] rounded-xs font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>موافق (OK)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
