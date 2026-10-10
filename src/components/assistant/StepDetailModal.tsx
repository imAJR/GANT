/**
 * GANT — Step-by-Step Educational Guidance Wizard for Stage 1
 * Provides explicit, numbered instructions for each of the 10 curriculum steps.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React from 'react';
import { X, Play, CheckCircle2, ArrowLeft, Lightbulb, Compass, MousePointer } from 'lucide-react';
import { TUTORIAL_STEPS } from '../../data/tutorialSteps';

interface StepDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepIndex: number;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({ isOpen, onClose, stepIndex }) => {
  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return null;

  // Detailed step-by-step instructional breakdown for each of the 10 steps
  const detailedSubsteps: Record<number, string[]> = {
    1: [
      'انقر على زر "خصائص المشروع" (Settings) في شريط الأدوات العلوي.',
      'افتح تبويب "التقويم" (Calendar) من نافذة الخصائص.',
      'تأكد من تحديد يومي الجمعة [5] والسبت [6] كعطلة أسبوعية.',
      'ألغِ تحديد يوم الأحد [0] ليكون يوم عمل عادي.',
      'انقر على "تطبيق وحفظ" لحفظ التقويم الجديد.',
    ],
    2: [
      'حدد صف مهمة "السيناريو" في جدول المهام الأيسر.',
      'انقر على زر "خصائص المهمة" (Sliders) في شريط الأدوات العلوي أو انقر نقراً مزدوجاً على المهمة.',
      'قم بتعديل مدة المهمة (مثلاً غيرها من القيمة 5) أو غيّر أولوية المهمة إلى High.',
      'انقر "موافق" لحفظ التعديلات.',
    ],
    3: [
      'حدد مهمة "الموسيقى" في جدول المهام.',
      'انقر على زر "تقديم المسافة البادئة" (Indent ➡️) في شريط الأدوات العلوي.',
      'كرر نفس العملية مع مهمتي "المشهد" و"الأزياء" لتصبح جميعها مهاماً فرعية تابعة لمهمة "الإخراج".',
    ],
    4: [
      'حدد صف مهمة "بروفات اللباس" في جدول المهام.',
      'انقر على زر المعين (◆) في شريط الأدوات العلوي.',
      'سيتم تحويل المهمة فوراً إلى معلم رئيسي (Milestone) بمدة صفر يوم ورمز معين.',
    ],
    5: [
      'حدد صف مهمة "البروفات" أو "الأضواء" في جدول المهام.',
      'انقر على زر "خصائص المهمة" أو عدل حقل المدة (Duration) مباشرة في الجدول (غيّر مدة البروفات عن 4 أو الأضواء عن 2).',
      'لاحظ كيف يتحدث تاريخ الانتهاء تلقائياً باستبعاد العطلات.',
    ],
    6: [
      'انقر على تبويب "الموارد وفريق العمل (Resources)" في أعلى مساحة العمل.',
      'استعرض أعضاء الفريق الأساسيين وتأكد من وجودهم أو أضف مورداً جديداً للمشروع.',
    ],
    7: [
      'في تبويب "الموارد وفريق العمل"، ابحث عن العضو "محمد".',
      'انقر على القائمة المنسدلة في عمود "الدور" بجوار اسم محمد.',
      'اختر دور "مدير المشروع" (Project Manager).',
    ],
    8: [
      'حدد مهمة مثل "الإخراج" أو "السيناريو" وافتح خصائص المهمة.',
      'انتقِل إلى تبويب الموارد (Resources) داخل نافذة خصائص المهمة.',
      'اختر مورداً وخصص نسبة التخصيص المطلوبة (مثل 100%) ثم احفظ.',
    ],
    9: [
      'في مخطط جانت أو تبويب التبعيات، اربط بين مهمة "طاقم التمثيل" ومهمة "قراءة السيناريو".',
      'تأكد أن نوع الرابط هو الانتهاء للبدء (Finish-to-Start - FS).',
    ],
    10: [
      'حدد مهمة "السيناريو" في جدول المهام.',
      'قم بتغيير تاريخ البدء (Start Date) إلى تاريخ مختلف عن التاريخ الابتدائي (مثل 2026-10-12).',
      'انقر خارج الخلية أو اضغط إدخال لتحديث الجدول.',
    ],
  };

  const stepsList = detailedSubsteps[step.number] || [
    step.shortInstruction,
    step.hint,
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-lg flex flex-col text-[#1E293B] overflow-hidden text-xs">
        {/* Title Bar */}
        <div className="px-3 py-2 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-bold text-[#0F172A] text-xs">
            <div className="w-5 h-5 rounded-full border border-blue-600 bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0">
              <img src="/assets/gant-bee/gant-bee-head.webp" alt="نحلة جانت" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
            </div>
            <span>الدليل التعليمي خطوة بخطوة — الخطوة {step.number} من 10</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 bg-white space-y-4 text-right">
          {/* Header Banner */}
          <div className="flex items-start gap-3 bg-blue-50/70 p-3 rounded border border-blue-200">
            <Compass className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] mb-1">
                {step.title}
              </h3>
              <p className="text-[11px] text-[#334155] leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Explicit Substeps */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#0F172A] flex items-center gap-1.5 text-xs">
              <MousePointer className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>خطوات التنفيذ العملي في البرنامج:</span>
            </h4>
            <div className="space-y-1.5 pr-1">
              {stepsList.map((sub, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-[#F8FAFC] p-2 rounded border border-[#CBD5E1]">
                  <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-[#1E293B] text-[11px] leading-relaxed font-medium">
                    {sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WHAT / WHERE / HOW Box */}
          <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded p-2.5 space-y-1 text-[11px]">
            <div className="flex items-start gap-1.5">
              <span className="font-bold text-blue-700 shrink-0">🎯 الهدف (What):</span>
              <span className="text-[#334155]">{step.whatText}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="font-bold text-amber-700 shrink-0">📍 المكان (Where):</span>
              <span className="text-[#334155]">{step.whereText}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="font-bold text-emerald-700 shrink-0">🛠️ الطريقة (How):</span>
              <span className="text-[#334155]">{step.howText}</span>
            </div>
          </div>

          {/* Mascot Tip */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span><strong>نصيحة نحلة جانت:</strong> {step.mascotTip}</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
            <button
              onClick={onClose}
              className="text-[#64748B] hover:text-[#0F172A] text-xs font-semibold hover:underline cursor-pointer"
            >
              إغلاق الدليل والعودة للعمل
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>فهمت، سأقوم بالتنفيذ</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1 bg-[#DFE3E8] border-t border-[#CBD5E1] text-[10px] text-[#64748B] flex items-center justify-between select-none">
          <span>التوجيه خطوة بخطوة — المرحلة الأولى</span>
          <span>مشروع المسرحية المدرسية</span>
        </div>
      </div>
    </div>
  );
};
