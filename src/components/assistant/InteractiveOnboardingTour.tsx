/**
 * GANT — Authentic Interactive Guided Spotlight Tour
 * Walks the student step-by-step through Stage 1 (Guided Tutorial)
 * directly on the live workspace UI using real element spotlights,
 * interactive target cutout overlays, and real-time state validation.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { TUTORIAL_STEPS } from '../../data/tutorialSteps';
import { getMascotAsset } from './GanttBeeAssistant';

interface InteractiveOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectProps?: () => void;
  onOpenTaskProps?: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export const InteractiveOnboardingTour: React.FC<InteractiveOnboardingTourProps> = ({
  isOpen,
  onClose,
  onOpenProjectProps,
  onOpenTaskProps,
}) => {
  const {
    state,
    computedTasks,
    profile,
    setTutorialStep,
    previousTutorialStep,
    completeCurrentTutorialStep,
    setActiveWorkspaceTab,
    selectTask,
    viewSettings,
  } = useProject();

  const currentStepIndex = profile.tutorialStepIndex;
  const currentStep = TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0];
  const isStepValid = currentStep ? currentStep.validate(state, computedTasks) : false;
  const studentName = profile.studentName || 'الطالب';
  const isRtl = (viewSettings.language || 'ar') === 'ar';

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Synchronize workspace tab and task selection for current step
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep.highlightTargetId === 'tab-resources' || currentStep.highlightTargetId?.startsWith('res-')) {
      setActiveWorkspaceTab('resources');
    } else {
      setActiveWorkspaceTab('gantt');
    }

    if (currentStep.targetTaskId) {
      selectTask(currentStep.targetTaskId);
    }
  }, [isOpen, currentStepIndex, currentStep, setActiveWorkspaceTab, selectTask]);

  // Find target element with fallback matching
  const findTargetElement = useCallback((): HTMLElement | null => {
    if (!currentStep) return null;

    const targetId = currentStep.highlightTargetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) return el;

      // Fallbacks
      if (targetId === 'row-task_rehearsals') {
        const alt = document.getElementById('task_rehearsals');
        if (alt) return alt;
      }
      if (targetId === 'row-task_cast') {
        const alt = document.getElementById('task_cast');
        if (alt) return alt;
      }
      if (targetId === 'row-task_script') {
        const alt = document.getElementById('task_script');
        if (alt) return alt;
      }
    }

    if (currentStep.targetTaskId) {
      const row = document.getElementById(`row-${currentStep.targetTaskId}`);
      if (row) return row;
    }

    return null;
  }, [currentStep]);

  // Update target bounding box and auto-scroll element into view
  const updateTargetRect = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    const element = findTargetElement();
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        });

        // Ensure visible in viewport
        const isInViewport =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth;

        if (!isInViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, findTargetElement]);

  // Periodic and event-based tracking of target element position
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow tab/workspace DOM to settle
    const timer = setTimeout(() => {
      updateTargetRect();
    }, 120);

    const handleWindowChange = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    const interval = setInterval(updateTargetRect, 600);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  if (!isOpen) return null;

  // Practical shortcut action to open relevant tools directly
  const handlePerformActionShortcut = () => {
    if (currentStep.highlightTargetId === 'btn-project-props' && onOpenProjectProps) {
      onOpenProjectProps();
    } else if (
      (currentStep.highlightTargetId === 'btn-task-props' || currentStep.targetTaskId) &&
      onOpenTaskProps
    ) {
      if (currentStep.targetTaskId) selectTask(currentStep.targetTaskId);
      onOpenTaskProps();
    } else if (currentStep.highlightTargetId === 'tab-resources') {
      setActiveWorkspaceTab('resources');
    }
  };

  const handleNextOrComplete = () => {
    if (isStepValid) {
      if (currentStepIndex === 9) {
        // Complete Stage 1 and transition to Stage Selection screen
        completeCurrentTutorialStep();
        onClose();
      } else {
        completeCurrentTutorialStep();
      }
    } else {
      completeCurrentTutorialStep(); // will trigger pedagogical guidance toast
    }
  };

  // Smart floating card position calculation
  const getCardStyle = (): React.CSSProperties => {
    const cardWidth = 440;
    const cardEstimatedHeight = 360;

    if (!targetRect) {
      // Default comfortable position at bottom-right (RTL) or bottom-left (LTR)
      return {
        position: 'fixed',
        bottom: 24,
        ...(isRtl ? { right: 24 } : { left: 24 }),
        zIndex: 50,
        width: `${cardWidth}px`,
      };
    }

    let top = targetRect.bottom + 16;
    // If not enough room below, place above
    if (top + cardEstimatedHeight > window.innerHeight - 20) {
      top = Math.max(16, targetRect.top - cardEstimatedHeight - 16);
    }

    // Horizontal placement aligned with target element
    let left = targetRect.left;
    if (isRtl) {
      left = targetRect.right - cardWidth;
    }

    // Clamp inside viewport
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    return {
      position: 'fixed',
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      zIndex: 50,
      width: `${cardWidth}px`,
    };
  };

  return (
    <>
      {/* 1. SPOTLIGHT CUTOUT PANELS: Dims background while keeping target interactive */}
      {targetRect ? (
        <div className="fixed inset-0 z-40 pointer-events-none select-none">
          {/* Top panel */}
          <div
            className="fixed bg-slate-950/65 backdrop-blur-[1px] transition-all duration-200 pointer-events-auto"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, targetRect.top - 6),
            }}
          />
          {/* Bottom panel */}
          <div
            className="fixed bg-slate-950/65 backdrop-blur-[1px] transition-all duration-200 pointer-events-auto"
            style={{
              top: targetRect.bottom + 6,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          {/* Left panel */}
          <div
            className="fixed bg-slate-950/65 backdrop-blur-[1px] transition-all duration-200 pointer-events-auto"
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: 0,
              width: Math.max(0, targetRect.left - 6),
              height: targetRect.height + 12,
            }}
          />
          {/* Right panel */}
          <div
            className="fixed bg-slate-950/65 backdrop-blur-[1px] transition-all duration-200 pointer-events-auto"
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: targetRect.right + 6,
              right: 0,
              height: targetRect.height + 12,
            }}
          />

          {/* Golden / Blue Pulsing Spotlight Ring (Target element is directly clickable inside) */}
          <div
            className="fixed rounded-xs ring-4 ring-amber-400 ring-offset-2 ring-offset-black/50 shadow-[0_0_28px_rgba(245,158,11,0.85)] pointer-events-none transition-all duration-200 animate-pulse"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
          />

          {/* Visual Interactive Beacon Arrow */}
          <div
            className="fixed pointer-events-none flex items-center gap-1 z-50 text-amber-300 drop-shadow-lg transition-all duration-200"
            style={{
              top: targetRect.top > 40 ? targetRect.top - 32 : targetRect.bottom + 8,
              left: targetRect.left + Math.max(0, targetRect.width / 2 - 40),
            }}
          >
            <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[11px] shadow-lg flex items-center gap-1 border border-amber-200 animate-bounce">
              <Sparkles className="w-3 h-3 text-blue-900" />
              <span>انقر أو تفاعل هنا</span>
            </span>
          </div>
        </div>
      ) : (
        /* Soft global overlay when element is being loaded or inside a closed dialog */
        <div className="fixed inset-0 z-40 bg-slate-950/45 pointer-events-none" />
      )}

      {/* 2. SMART GUIDED COACHMARK CARD */}
      <div
        ref={cardRef}
        style={getCardStyle()}
        className="bg-[#ECEFF3] border-2 border-[#2563EB] rounded-xs shadow-2xl flex flex-col text-[#1E293B] overflow-hidden text-xs transition-all duration-200 animate-in fade-in zoom-in-95"
      >
        {/* Title Bar */}
        <div className="px-3 py-1.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
          <div className="flex items-center gap-2 font-bold text-[#0F172A] text-xs">
            <div className="w-5 h-5 rounded-full border border-blue-600 bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-xs">
              <img
                src="/assets/gant-bee/gant-bee-head.webp"
                alt="نحلة جانت"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="truncate">مرشد التأهيل التفاعلي — المرحلة 1</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#CBD5E1] rounded-xs transition-colors cursor-pointer"
              title={isMinimized ? 'توسيع' : 'تصغير'}
            >
              {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer font-bold text-xs"
              title="إغلاق المرشد (متابعة ذاتية)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Card Body */}
        {!isMinimized && (
          <div className="p-3.5 bg-white space-y-2.5 text-right">
            {/* Step Tracker Ribbon (1 to 10) */}
            <div className="space-y-1.5 pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                    الخطوة {currentStep.number} من 10
                  </span>
                  <h3 className="text-xs font-bold text-[#0F172A] truncate max-w-[210px]">
                    {currentStep.title}
                  </h3>
                </div>
                <span className="text-[10px] text-[#64748B]">
                  المكتمل: <strong className="text-emerald-700 font-mono">{profile.completedTutorialSteps.length}/10</strong>
                </span>
              </div>

              {/* 10 Step Buttons */}
              <div className="flex items-center justify-between gap-1 pt-0.5">
                {TUTORIAL_STEPS.map((st, i) => {
                  const isCurrent = i === currentStepIndex;
                  const isDone = profile.completedTutorialSteps.includes(i);
                  return (
                    <button
                      key={st.id}
                      onClick={() => setTutorialStep(i)}
                      className={`flex-1 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#2563EB] text-white border-[#1D4ED8] shadow-xs scale-105'
                          : isDone
                          ? 'bg-[#ECFDF5] text-[#059669] border-[#10B981]'
                          : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                      }`}
                      title={`الخطوة ${i + 1}: ${st.title}`}
                    >
                      {isDone ? `✓` : i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mascot Tip */}
            <div className="flex items-start gap-2.5 bg-[#F8FAFC] p-2 rounded border border-[#CBD5E1]">
              <div className="w-10 h-10 rounded-lg border border-[#202A44] bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                <img
                  src={getMascotAsset('guiding')}
                  alt="نحلة جانت"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] text-[#334155] leading-relaxed">
                {currentStep.mascotTip}
              </p>
            </div>

            {/* 3-Point Pedagogical Directives (WHAT, WHERE, HOW) */}
            <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded p-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-blue-700 shrink-0 w-20">🎯 الهدف:</span>
                <span className="text-[#1E293B] leading-relaxed">{currentStep.whatText}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-amber-700 shrink-0 w-20">📍 الموضع:</span>
                <span className="text-[#1E293B] leading-relaxed font-medium">{currentStep.whereText}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-700 shrink-0 w-20">🛠️ التنفيذ:</span>
                <span className="text-[#1E293B] leading-relaxed">{currentStep.howText}</span>
              </div>
            </div>

            {/* Real-Time Live Status Card & Action Trigger */}
            <div
              className={`p-2.5 rounded border transition-all text-xs flex items-center justify-between ${
                isStepValid
                  ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                  : 'bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isStepValid ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 animate-bounce" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 animate-pulse" />
                )}
                <span className="font-semibold text-[11px]">
                  {isStepValid
                    ? `أحسنت يا ${studentName}! تم إنجاز المطلوب لهذه الخطوة بنجاح ✓`
                    : currentStep.actionRequired}
                </span>
              </div>

              {!isStepValid && (
                <button
                  onClick={handlePerformActionShortcut}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px] border border-amber-300 transition-colors cursor-pointer shrink-0 flex items-center gap-0.5"
                  title="فتح الأداة أو التبويب الخاص بهذه الخطوة"
                >
                  <span>فتح الأداة</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Hint Accordion */}
            {showHint ? (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded text-[10px] text-[#475569] flex items-start justify-between gap-1.5">
                <div className="flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>تلميح:</strong> {currentStep.hint}
                  </span>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-neutral-500 hover:text-black cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3 h-3" />
                <span>أحتاج تلميحًا إضافيًا لهذه الخطوة</span>
              </button>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {currentStepIndex > 0 && (
                  <button
                    onClick={previousTutorialStep}
                    className="px-2 py-1 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] font-semibold rounded-xs transition-colors flex items-center gap-1 cursor-pointer border border-[#CBD5E1] text-xs"
                    title="الرجوع للخطوة السابقة"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>السابق</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-[#64748B] hover:text-[#0F172A] text-[11px] hover:underline cursor-pointer px-1"
                >
                  إيقاف مؤقت
                </button>
              </div>

              <button
                onClick={handleNextOrComplete}
                className={`px-3.5 py-1.5 rounded-xs font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isStepValid
                    ? currentStepIndex === 9
                      ? 'bg-[#10B981] hover:bg-[#059669] text-white border border-[#059669] animate-pulse ring-2 ring-emerald-300'
                      : 'bg-[#10B981] hover:bg-[#059669] text-white border border-[#059669]'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#1D4ED8]'
                }`}
              >
                <span>
                  {isStepValid
                    ? currentStepIndex === 9
                      ? 'إكمال المرحلة 1 والانتقال للمراحل 🎉'
                      : 'الخطوة التالية ⬅'
                    : 'تحقق من اكتمال الإجراء'}
                </span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
