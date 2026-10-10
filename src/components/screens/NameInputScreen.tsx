/**
 * GANT — Student Name Prompt Screen
 * Requests the student's name, persists it, and transitions to stage selection.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState } from 'react';
import { User, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { GanttLogo } from '../common/GanttLogo';

export const NameInputScreen: React.FC = () => {
  const { profile, setStudentName, setAppScreen } = useProject();
  const [inputName, setInputName] = useState(profile.studentName || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setErrorMsg('فضلاً أدخل اسمك للمتابعة.');
      return;
    }
    setStudentName(trimmed);
    setAppScreen('stage_select');
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#E4E7EB] text-[#1E293B] p-4 select-none relative overflow-hidden font-sans">
      {/* Desktop Window Frame */}
      <div className="relative z-10 max-w-md w-full bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl flex flex-col overflow-hidden text-[12px]">
        {/* Desktop Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>تسجيل هوية الطالب (Student Registration Wizard)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#CBD5E1]" />
          </div>
        </div>

        {/* Window Content */}
        <div className="p-6 bg-white flex flex-col text-right space-y-4">
          {/* Header with Logo */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
            <GanttLogo size="md" />
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">
                مرحبًا بك في GANT!
              </h2>
              <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                تخطيط وإدارة <strong className="text-[#2563EB]">مشروع المسرحية المدرسية</strong>.<br />
                فضلاً سجّل اسمك للبدء في رحلة التعلم.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#334155] mb-1">
                اسم الطالب / الطالبة:
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="اكتب اسمك الثلاثي أو الثنائي هنا..."
                  value={inputName}
                  autoFocus
                  onChange={(e) => {
                    setInputName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#94A3B8] rounded px-3 py-2 text-[#0F172A] text-xs placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
              {errorMsg && (
                <span className="text-[11px] text-red-600 font-medium mt-1 block">
                  {errorMsg}
                </span>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAppScreen('welcome')}
                className="px-4 py-1.5 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] font-semibold text-xs rounded-xs border border-[#CBD5E1] transition-colors cursor-pointer"
              >
                رجوع
              </button>

              <button
                type="submit"
                className="px-6 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs rounded-xs border border-[#1D4ED8] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>متابعة إلى المراحل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-[#E2E8F0] text-[10px] text-[#64748B] text-center">
            التقنية الرقمية 3 · الوحدة الأولى: تخطيط المشروعات
          </div>
        </div>

        {/* Desktop Status Bar */}
        <div className="px-3 py-1 bg-[#E2E6EA] border-t border-[#CBD5E1] text-[10px] text-[#64748B] flex items-center justify-between select-none">
          <span>GANT Simulator 2026</span>
          <span>معالج التسجيل</span>
        </div>
      </div>
    </div>
  );
};
