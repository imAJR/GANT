/**
 * GANT — Stage Selection Screen (نظام المراحل)
 * Manages progression through Stage 1 (Guided Tutorial), Stage 2 (Independent Challenge),
 * and Stage 3 (Free Management) on the School Play Project.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  User,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { OFFICIAL_MASTERY_SKILLS } from '../../data/tutorialSteps';
import { GanttLogo } from '../common/GanttLogo';

export const StageSelectorScreen: React.FC = () => {
  const { profile, selectStage, setAppScreen, resetStudentProgress } = useProject();
  const [showMasteryModal, setShowMasteryModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const studentName = profile.studentName || 'الطالب';
  const unlocked = profile.unlockedStages;

  const isStage1Completed = profile.completedTutorialSteps.length >= 10;
  const isStage2Completed = profile.stage2Completed;

  const stagesData = [
    {
      stage: 1 as const,
      title: 'المرحلة 1 — التعلم الموجّه',
      englishTitle: 'Guided Tutorial',
      badge: 'الخطوة الأولى',
      description: 'تعلم إدارة وتخطيط مشروع المسرحية المدرسية خطوة بخطوة عبر 10 خطوات تعليمية يقودك فيها المساعد الذكي "نحلة جانت".',
      isUnlocked: true,
      isCompleted: isStage1Completed,
      progressInfo: `${profile.completedTutorialSteps.length}/10 خطوات مكتملة`,
      actionLabel: isStage1Completed ? 'مراجعة المرحلة 1' : 'ابدأ المرحلة 1',
    },
    {
      stage: 2 as const,
      title: 'المرحلة 2 — التحدي المستقل',
      englishTitle: 'Independent Challenge',
      badge: 'تحدي المهارة',
      description: 'نفذ أهداف مشروع المسرحية المدرسية بنفسك دون إرشاد تفصيلي مستمر، واكتشف الأدوات لحل التحديات وإتقان التبعيات والجدولة.',
      isUnlocked: unlocked.includes(2),
      isCompleted: isStage2Completed,
      lockReason: 'أكمل جميع خطوات المرحلة الأولى (التعلم الموجّه) لفتح هذا التحدي.',
      progressInfo: isStage2Completed ? 'تم اجتياز التحدي بنجاح' : 'جاهز للتحدي',
      actionLabel: isStage2Completed ? 'إعادة التحدي' : 'ابدأ التحدي المستقل',
    },
    {
      stage: 3 as const,
      title: 'المرحلة 3 — الإدارة الحرة',
      englishTitle: 'Free Management',
      badge: 'الاحتراف الكامل',
      description: 'حرية كاملة لإدارة مشروع المسرحية المدرسية بأدوات محاكي GANT؛ اضبط التواريخ والمدد والموارد واختبر مختلف سيناريوهات التخطيط.',
      isUnlocked: unlocked.includes(3),
      isCompleted: profile.stage3Completed,
      lockReason: 'اجتز المرحلة الثانية (التحدي المستقل) لفتح الإدارة الحرة للمشروع.',
      progressInfo: unlocked.includes(3) ? 'مفتوح للإدارة' : 'مقفل',
      actionLabel: 'دخول الإدارة الحرة',
    },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#E4E7EB] text-[#1E293B] select-none overflow-hidden font-sans">
      {/* Top Desktop Toolbar Header */}
      <header className="px-4 py-2 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <GanttLogo size="sm" />
          <div className="border-r border-[#CBD5E1] pr-2.5 mr-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F172A]">
              <span>مدير المراحل التعليمية (Stage Manager)</span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              مشروع المسرحية المدرسية · التقنية الرقمية 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Student Profile Tag */}
          <div className="flex items-center gap-1.5 bg-white border border-[#CBD5E1] px-2.5 py-1 rounded-xs text-xs">
            <User className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-[#64748B]">الطالب:</span>
            <strong className="text-[#0F172A]">{studentName}</strong>
          </div>

          <button
            onClick={() => setShowMasteryModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs border border-[#1D4ED8]"
          >
            <Award className="w-3.5 h-3.5" />
            <span>لوحة الإتقان (6 مهارات)</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-1">
            مرحبًا بك يا <span className="text-[#2563EB]">{studentName}</span> في محاكي GANT
          </h2>
          <p className="text-xs text-[#475569] max-w-xl mx-auto leading-relaxed">
            اختر مرحلتك لبدء تخطيط وإدارة <strong className="text-[#0F172A]">مشروع المسرحية المدرسية</strong>. يتم فتح المراحل المتقدمة تدريجيًا عند إثبات إتقانك لكل مرحلة.
          </p>
        </div>

        {/* Stages Grid (3 Desktop Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {stagesData.map((item) => (
            <div
              key={item.stage}
              className={`rounded-xs border flex flex-col justify-between transition-all bg-white overflow-hidden shadow-xs ${
                item.isUnlocked
                  ? 'border-[#94A3B8] hover:border-[#2563EB] hover:shadow-md'
                  : 'border-[#CBD5E1] opacity-70 bg-[#F8FAFC]'
              }`}
            >
              {/* Card Header Strip */}
              <div className="px-4 py-2.5 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-white border border-[#CBD5E1] text-[#334155]">
                  {item.badge}
                </span>

                {item.isCompleted ? (
                  <div className="flex items-center gap-1 text-[11px] text-[#059669] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مكتمل</span>
                  </div>
                ) : !item.isUnlocked ? (
                  <div className="flex items-center gap-1 text-[11px] text-[#94A3B8]">
                    <Lock className="w-3 h-3" />
                    <span>مقفل</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#2563EB] font-mono font-bold">
                    {item.progressInfo}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-0.5">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-[#64748B] font-mono block mb-2">
                    {item.englishTitle}
                  </span>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2">
                  {item.isUnlocked ? (
                    <button
                      onClick={() => selectStage(item.stage)}
                      className="w-full py-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-bold text-xs rounded-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#1D4ED8]"
                    >
                      <span>{item.actionLabel}</span>
                      <Play className="w-3 h-3 fill-white" />
                    </button>
                  ) : (
                    <div className="p-2 bg-[#F1F5F9] rounded-xs border border-[#E2E8F0] text-[10px] text-[#64748B] text-center flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>{item.lockReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center gap-3 text-xs text-[#64748B]">
          <button
            onClick={() => setAppScreen('name_input')}
            className="hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            تغيير الاسم
          </button>
          <span>·</span>
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="hover:text-red-600 transition-colors cursor-pointer font-bold text-red-700"
          >
            إعادة ضبط التقدم التعليمي
          </button>
        </div>
      </main>

      {/* Reset Progress Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-md flex flex-col text-[#1E293B] overflow-hidden text-xs">
            <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                <span>تأكيد إعادة ضبط التقدم التعليمي</span>
              </div>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-white space-y-3">
              <p className="text-xs text-[#1E293B] leading-relaxed">
                هل أنت متأكد من رغبتك في إعادة ضبط جميع خطوات التدريب وتقدم المراحل والعودة إلى نقطة البداية؟ سيؤدي هذا إلى مسح التقدم المحفوظ وإعادة مشروع المسرحية المدرسية لحالته الأولى.
              </p>
            </div>
            <div className="px-4 py-2 bg-[#DFE3E8] border-t border-[#CBD5E1] flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-1 bg-white hover:bg-slate-100 text-[#334155] border border-[#CBD5E1] rounded-xs cursor-pointer text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  resetStudentProgress();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xs border border-red-700 cursor-pointer text-xs"
              >
                تأكيد وإعادة الضبط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Mastery Skills Modal */}
      {showMasteryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col text-[#1E293B] overflow-hidden text-xs">
            {/* Desktop Dialog Title Bar */}
            <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
                <Award className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>لوحة إتقان مهارات تخطيط المشروعات (التقنية الرقمية 3)</span>
              </div>
              <button
                onClick={() => setShowMasteryModal(false)}
                className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-white overflow-y-auto space-y-3 flex-1">
              <p className="text-[11px] text-[#475569] leading-relaxed mb-2">
                تعتمد هذه اللوحة على المهارات الرسمية الست المعتمدة في منهج التقنية الرقمية 3 — الوحدة الأولى. يقيس تطبيق GANT اكتسابك لكل مهارة من خلال تنفيذ خطوات مشروع المسرحية المدرسية.
              </p>

              <div className="space-y-2">
                {OFFICIAL_MASTERY_SKILLS.map((skill) => {
                  const isDone = isStage1Completed;
                  return (
                    <div
                      key={skill.id}
                      className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-xs bg-[#2563EB] text-white font-bold flex items-center justify-center shrink-0 text-xs font-mono">
                        {skill.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <strong className="text-[#0F172A] font-bold text-xs">
                            {skill.title}
                          </strong>
                          {isDone ? (
                            <span className="text-[10px] text-[#059669] bg-[#DCFCE7] border border-[#86EFAC] px-1.5 py-0.2 rounded font-bold">
                              متقن ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] px-1.5 py-0.2 rounded font-bold">
                              قيد الإتقان
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#475569] leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-2 bg-[#DFE3E8] border-t border-[#CBD5E1] flex justify-end">
              <button
                onClick={() => setShowMasteryModal(false)}
                className="px-5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xs border border-[#1D4ED8] cursor-pointer text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
