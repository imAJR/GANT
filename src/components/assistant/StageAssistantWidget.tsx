/**
 * GANT — Live Stage Pedagogical Assistant Widget ("نحلة جانت")
 * Docked desktop educational assistant with step navigation,
 * real-time validation, progressive hints, first-time tour, and curriculum guidance.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Award,
  Check,
  BookOpen,
  Play,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { TUTORIAL_STEPS, STAGE_2_OBJECTIVES } from '../../data/tutorialSteps';
import { StepDetailModal } from './StepDetailModal';
import { GanttBeeAssistant, getMascotAsset } from './GanttBeeAssistant';

interface StageAssistantWidgetProps {
  onOpenTour?: () => void;
  onOpenAssistant?: () => void;
  onOpenProjectProps?: () => void;
  onOpenTaskProps?: () => void;
}

export const StageAssistantWidget: React.FC<StageAssistantWidgetProps> = ({ onOpenTour, onOpenAssistant }) => {
  const {
    state,
    computedTasks,
    profile,
    setTutorialStep,
    advanceTutorialStep,
    previousTutorialStep,
    completeCurrentTutorialStep,
    completeStage2,
    setAppScreen,
  } = useProject();

  const [isMinimized, setIsMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAllStepsModal, setShowAllStepsModal] = useState(false);
  const [showStepDetailModal, setShowStepDetailModal] = useState(false);

  const studentName = profile.studentName || 'الطالب';
  const currentStage = profile.currentStage;
  const stepIdx = profile.tutorialStepIndex;
  const currentStep = TUTORIAL_STEPS[stepIdx];

  // Real-time stage 1 validation and contextual feedback from the actual project state
  const isStepValid = currentStep ? currentStep.validate(state, computedTasks) : false;
  const currentStepFeedback = currentStep
    ? currentStep.getPedagogicalError?.(state, computedTasks) || currentStep.actionRequired
    : 'اختر خطوة تعليمية للمتابعة.';

  // Show first-time welcome tour modal when entering Stage 1 for the first time
  useEffect(() => {
    if (currentStage === 1 && profile.completedTutorialSteps.length === 0 && stepIdx === 0) {
      // Check if session storage already marked welcome shown for this session
      const welcomed = sessionStorage.getItem('GANT_STAGE1_WELCOMED');
      if (!welcomed) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('GANT_STAGE1_WELCOMED', 'true');
      }
    }
  }, [currentStage, profile.completedTutorialSteps.length, stepIdx]);

  // Real-time stage 2 validation
  const stage2Results = STAGE_2_OBJECTIVES.map((obj) => ({
    ...obj,
    isMet: obj.check(state, computedTasks),
  }));
  const totalStage2Met = stage2Results.filter((r) => r.isMet).length;
  const isAllStage2Met = totalStage2Met === STAGE_2_OBJECTIVES.length;

  if (isMinimized) {
    return (
      <div className="fixed bottom-8 left-4 z-40 select-none">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#DFE3E8] hover:bg-[#CBD5E1] text-[#0F172A] font-bold rounded-xs shadow-md border border-[#718096] transition-all cursor-pointer text-xs"
        >
          <div className="w-5 h-5 rounded-full border border-blue-600 bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0">
            <img
              src="/assets/gant-bee/gant-bee-head.webp"
              alt="نحلة جانت"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="flex items-center gap-1">
            <span>نحلة جانت:</span>
            <span>
              {currentStage === 1
                ? `الخطوة ${stepIdx + 1}/10`
                : currentStage === 2
                ? `التحدي (${totalStage2Met}/6)`
                : 'الإدارة الحرة'}
            </span>
          </span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Docked Assistant Widget */}
      <div className="fixed bottom-7 left-4 z-40 max-w-sm w-full bg-[#F8FAFC] border border-[#718096] rounded-xs shadow-2xl text-[#1E293B] p-0 select-none text-xs overflow-hidden">
        {/* Authentic Desktop Title Bar */}
        <div className="flex items-center justify-between bg-[#DFE3E8] border-b border-[#CBD5E1] px-3 py-1.5 select-none">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full border bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 ${
              isStepValid ? 'border-[#10B981]' : 'border-[#2563EB]'
            }`}>
              <img
                src="/assets/gant-bee/gant-bee-head.webp"
                alt="نحلة جانت"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
              <span>نحلة جانت (المساعد التعليمي)</span>
              <span className="text-[10px] bg-[#E2E8F0] border border-[#CBD5E1] text-[#2563EB] px-1.5 py-0.2 rounded font-mono font-bold">
                المرحلة {currentStage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenAssistant}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              title="محادثة نحلة جانت الذكية (Gemini 3.8 Flash)"
            >
              <span>محادثة ذكية 💬</span>
            </button>
            {currentStage === 1 && (
              <button
                onClick={() => setShowWelcomeModal(true)}
                className="w-5 h-5 flex items-center justify-center text-[#2563EB] hover:bg-[#CBD5E1] rounded-xs transition-colors cursor-pointer"
                title="دليل الجولة التعليمية"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMinimized(true)}
              className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#CBD5E1] rounded-xs transition-colors cursor-pointer"
              title="تصغير اللوحة"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3 bg-white space-y-2.5">
          {/* STAGE 1: GUIDED TUTORIAL */}
          {currentStage === 1 && currentStep && (
            <div className="space-y-2">
              {/* Step Ribbon (1 to 10) */}
              <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-[#0F172A] text-[11px] truncate">
                    الخطوة {currentStep.number}: {currentStep.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowStepDetailModal(true)}
                    className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer border border-amber-300 flex items-center gap-0.5"
                    title="عرض دليل خطوة بخطوة للخطوة الحالية"
                  >
                    <span>دليل مفصل 🧭</span>
                  </button>
                  <button
                    onClick={() => setShowAllStepsModal(true)}
                    className="text-[10px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                  >
                    كل الخطوات
                  </button>
                </div>
              </div>

              {/* Step Dots Ribbon */}
              <div className="flex items-center justify-between gap-0.5">
                {TUTORIAL_STEPS.map((st, i) => (
                  <button
                    key={st.id}
                    onClick={() => setTutorialStep(i)}
                    className={`w-4 h-4 text-[9px] font-mono rounded-xs font-bold transition-all cursor-pointer ${
                      i === stepIdx
                        ? 'bg-[#2563EB] text-white ring-1 ring-[#1D4ED8] scale-110'
                        : profile.completedTutorialSteps.includes(i)
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#E2E8F0] text-[#64748B] hover:bg-[#CBD5E1]'
                    }`}
                    title={`خطوة ${i + 1}: ${st.title}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* 2.5D Full Body Mascot Card with Live Pedagogical Guidance */}
              <div className="flex items-center gap-2.5 p-2 bg-gradient-to-r from-blue-50/70 to-amber-50/50 rounded-xs border border-[#CBD5E1] shadow-xs">
                <GanttBeeAssistant
                  mood={isStepValid ? 'success' : 'guiding'}
                  size="sm"
                  hideBubble={true}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-[#0F172A] text-[11px]">نحلة جانت التعليمية</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isStepValid
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {isStepValid ? 'إنجاز رائع 🌟' : 'إرشاد مباشر 🧭'}
                    </span>
                  </div>
                  <p className="text-[#334155] text-[11px] leading-relaxed font-medium">
                    {isStepValid ? `رائع يا ${studentName}! أنجزت المطلوب بنجاح.` : currentStep.mascotTip}
                  </p>
                </div>
              </div>

              {/* WHAT + WHERE + HOW Structured Guidance */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xs p-2 space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#2563EB] shrink-0">🎯 WHAT:</span>
                  <span className="text-[#334155]">{currentStep.whatText}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#D97706] shrink-0">📍 WHERE:</span>
                  <span className="text-[#334155]">{currentStep.whereText}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#059669] shrink-0">🛠️ HOW:</span>
                  <span className="text-[#334155]">{currentStep.howText}</span>
                </div>
              </div>

              {/* Real-time Status Card */}
              <div
                className={`p-2 rounded border transition-all text-xs ${
                  isStepValid
                    ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                    : 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isStepValid ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 animate-bounce" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 animate-pulse" />
                  )}
                  <span className="font-semibold text-[11px] leading-tight">
                    {isStepValid
                      ? `ممتاز يا ${studentName}! تم إنجاز الإجراء بنجاح.`
                      : currentStepFeedback}
                  </span>
                </div>
              </div>

              {/* Hint Accordion */}
              {showHint && (
                <div className="p-2 bg-[#F1F5F9] rounded border border-[#CBD5E1] text-[11px] text-[#334155] leading-relaxed">
                  <strong className="text-[#2563EB] block mb-0.5">💡 تلميح تعليمي:</strong>
                  {currentStep.hint}
                </div>
              )}

              {/* Navigation & Verification Buttons */}
              <div className="flex items-center justify-between pt-1 gap-1.5 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-[#64748B] hover:text-[#2563EB] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'إخفاء التلميح' : 'أحتاج تلميحًا'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {stepIdx > 0 && (
                    <button
                      onClick={previousTutorialStep}
                      className="px-2 py-1 rounded-xs bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] text-xs font-semibold cursor-pointer border border-[#CBD5E1]"
                      title="الخطوة السابقة"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={completeCurrentTutorialStep}
                    className={`px-3 py-1 rounded-xs font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                      isStepValid
                        ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs'
                        : 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                    }`}
                    title={isStepValid ? 'الانتقال للخطوة التالية' : 'تحقق من اكتمال الخطوة'}
                  >
                    <span>{isStepValid ? (stepIdx === 9 ? 'إكمال المرحلة والانتقال للمراحل 🎉' : 'الخطوة التالية') : 'تحقق من الخطوة'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {profile.completedTutorialSteps.length >= 10 && (
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setAppScreen('stage_select')}
                    className="w-full py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>الذهاب لصفحة المراحل (المرحلة 2 مفتوحة) ⬅</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: INDEPENDENT CHALLENGE */}
          {currentStage === 2 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] text-[11px]">
                  أهداف التحدي المستقل للمسرحية المدرسية
                </span>
                <span className="text-[10px] font-mono text-[#2563EB] font-bold">
                  {totalStage2Met}/{STAGE_2_OBJECTIVES.length} مكتمل
                </span>
              </div>

              {/* 2.5D Full Body Mascot Card in Stage 2 */}
              <div className="flex items-center gap-2.5 p-2 bg-gradient-to-r from-blue-50/70 to-purple-50/50 rounded-xs border border-[#CBD5E1] shadow-xs">
                <GanttBeeAssistant
                  mood={totalStage2Met === 6 ? 'success' : 'observing'}
                  size="sm"
                  hideBubble={true}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-[#0F172A] text-[11px]">نحلة جانت (الملاحظة والتقييم)</span>
                    <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                      {totalStage2Met}/6
                    </span>
                  </div>
                  <p className="text-[#334155] text-[11px] leading-relaxed">
                    {totalStage2Met === 6
                      ? 'أبدعت يا بطل! حققت جميع متطلبات التحدي المستقل.'
                      : 'أنا أراقب عملك المستقل. نفذ جميع المتطلبات الستة لإثبات إتقانك.'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {stage2Results.map((obj) => (
                  <div
                    key={obj.id}
                    className={`p-1.5 rounded-xs border text-[11px] flex items-center justify-between ${
                      obj.isMet
                        ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B]'
                    }`}
                  >
                    <span className="truncate">{obj.title}</span>
                    {obj.isMet ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mr-1" />
                    ) : (
                      <span className="text-[9px] text-[#94A3B8] font-mono shrink-0 mr-1">في الانتظار</span>
                    )}
                  </div>
                ))}
              </div>

              {isAllStage2Met ? (
                <button
                  onClick={completeStage2}
                  className="w-full py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xs text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>اجتياز التحدي وفتح المرحلة 3</span>
                </button>
              ) : (
                <p className="text-[10px] text-[#64748B] text-center">
                  نفذ جميع متطلبات المشروع الستة بشكل مستقل لفتح المرحلة 3.
                </p>
              )}
            </div>
          )}

          {/* STAGE 3: FREE MANAGEMENT */}
          {currentStage === 3 && (
            <div className="space-y-2">
              <p className="text-[#334155] text-[11px] leading-relaxed">
                أنت الآن في وضع <strong>الإدارة الحرة</strong> لمشروع المسرحية المدرسية. يمكنك ضبط التواريخ والمدد والتبعيات بحرية تامة واختبار محرك جانت.
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-[#CBD5E1]">
                <span className="text-[10px] text-[#64748B]">
                  مشروع المسرحية المدرسية (2026)
                </span>
                <button
                  onClick={() => setAppScreen('stage_select')}
                  className="text-[#2563EB] hover:text-[#1D4ED8] text-xs font-semibold cursor-pointer"
                >
                  العودة لقائمة المراحل
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STAGE 1 WELCOME & TOUR MODAL */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-lg flex flex-col text-[#1E293B] overflow-hidden text-xs">
            {/* Title Bar */}
            <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
              <div className="flex items-center gap-2 font-bold text-[#0F172A] text-xs">
                <div className="w-4 h-4 rounded-full border border-blue-600 bg-white flex items-center justify-center p-0.2 overflow-hidden shrink-0">
                  <img src="/assets/gant-bee/gant-bee-head.webp" alt="نحلة جانت" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                </div>
                <span>مرحبًا بك في المرحلة الأولى: التعلم الموجّه (مشروع المسرحية المدرسية)</span>
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 bg-white space-y-4 text-right">
              <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded border border-[#CBD5E1]">
                <GanttBeeAssistant
                  mood="friendly"
                  size="sm"
                  hideBubble={true}
                  className="shrink-0"
                />
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] mb-0.5">
                    أنا نحلة جانت، مرشدك التعليمي! 🐝
                  </h3>
                  <p className="text-[11px] text-[#475569] leading-relaxed">
                    يسعدني أن أرافقك يا <strong className="text-[#2563EB]">{studentName}</strong> في تخطيط <strong className="text-[#0F172A]">مشروع المسرحية المدرسية</strong> ضمن مقرر التقنية الرقمية 3.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#334155]">
                <h4 className="font-bold text-[#0F172A]">كيف تتعلم في هذه المرحلة؟</h4>
                <ul className="list-disc list-inside space-y-1 text-[#475569] pr-1">
                  <li><strong>عبر 10 خطوات مترابطة:</strong> سننتقل معًا من خصائص المشروع وحتى تعديل التواريخ والاعتماديات.</li>
                  <li><strong>توجيه ذكي (WHAT, WHERE, HOW):</strong> يوضح لك المساعد ماذا تفعل، وأين تجد الأداة، وكيف تنفذها بدقة.</li>
                  <li><strong>تحقق فوري:</strong> يتحقق النظام تلقائيًا من إنجازك لكل خطوة لتنتقل للخطوة التالية بكل ثقة.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>توجيه:</strong> يمكنك دائماً فتح لوحة المساعد أسفل اليسار لمتابعة التعليمات أو طلب التلميح إن واجهتك أي صعوبة.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>ابدأ الجولة الآن</span>
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL STEPS QUICK OVERVIEW MODAL */}
      {showAllStepsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEFF3] border border-[#718096] rounded-xs shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col text-[#1E293B] overflow-hidden text-xs">
            {/* Title Bar */}
            <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
              <div className="flex items-center gap-2 font-bold text-[#0F172A] text-xs">
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>خطوات المرحلة الأولى العشر (التعلم الموجّه — المسرحية المدرسية)</span>
              </div>
              <button
                onClick={() => setShowAllStepsModal(false)}
                className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="p-4 bg-white overflow-y-auto space-y-2 flex-1">
              {TUTORIAL_STEPS.map((st, i) => {
                const isCompleted = profile.completedTutorialSteps.includes(i);
                const isCurrent = i === stepIdx;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setTutorialStep(i);
                      setShowAllStepsModal(false);
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-400 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#2563EB]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs font-mono ${
                        isCurrent
                          ? 'bg-[#2563EB] text-white'
                          : isCompleted
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <strong className="text-[#0F172A] font-bold text-xs">
                          {st.title}
                        </strong>
                        {isCompleted && (
                          <span className="text-[10px] text-[#059669] font-bold">مكتمل ✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#475569] leading-relaxed">
                        {st.shortInstruction}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-2 bg-[#DFE3E8] border-t border-[#CBD5E1] flex justify-end">
              <button
                onClick={() => setShowAllStepsModal(false)}
                className="px-5 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xs border border-[#1D4ED8] cursor-pointer text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP DETAIL STEP-BY-STEP GUIDANCE MODAL */}
      <StepDetailModal
        isOpen={showStepDetailModal}
        onClose={() => setShowStepDetailModal(false)}
        stepIndex={stepIdx}
      />
    </>
  );
};
