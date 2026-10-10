/**
 * GANT — Interactive 2.5D Multi-Layered Mascot Component ("GANT Bee" / نحلة جانت)
 * Professional vector/raster mascot with state machine, responsive animations,
 * expression changes, and real-time app binding using official GANT Bee assets.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';

export type MascotMood =
  | 'idle'
  | 'friendly'
  | 'observing'
  | 'guiding'
  | 'pointing'
  | 'waiting_for_user'
  | 'detecting'
  | 'success'
  | 'correction'
  | 'transition';

interface GanttBeeAssistantProps {
  mood?: MascotMood;
  message?: string;
  isAnimating?: boolean;
  onActionClick?: () => void;
  actionLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  hideBubble?: boolean;
  className?: string;
}

export const GanttBeeAssistant: React.FC<GanttBeeAssistantProps> = ({
  mood,
  message,
  isAnimating = true,
  onActionClick,
  actionLabel,
  size = 'md',
  hideBubble = false,
  className = '',
}) => {
  const { state, computedTasks, viewSettings, profile } = useProject();

  const [currentMood, setCurrentMood] = useState<MascotMood>(mood || 'idle');
  const [speechText, setSpeechText] = useState(message || 'أهلاً بك! أنا نحلة جانت، مساعدك الذكي لتخطيط المشروعات.');

  const selectedTask = computedTasks.find((t) => t.id === viewSettings.selectedTaskId);
  const currentStepIndex = profile.tutorialStepIndex;

  // React to prop updates
  useEffect(() => {
    if (mood) setCurrentMood(mood);
  }, [mood]);

  useEffect(() => {
    if (message) setSpeechText(message);
  }, [message]);

  // Sync mood & message with app state when not explicitly overridden
  useEffect(() => {
    if (message || mood) return;

    if (profile.currentStage === 1) {
      if (selectedTask) {
        setSpeechText(`المهمة المحددة حالياً: "${selectedTask.name}" (${selectedTask.duration} يوم). هل ترغب في تعديل خصائصها؟`);
        setCurrentMood('pointing');
      } else {
        setSpeechText(`أهلاً بك يا ${profile.studentName || 'بطل'}! أنا هنا لمساعدتك في خطوات مشروع المسرحية المدرسية.`);
        setCurrentMood('guiding');
      }
    } else if (profile.currentStage === 2) {
      setSpeechText('أنت في التحدي المستقل! نفذ الأهداف الستة المطلوبة لإثبات إتقانك.');
      setCurrentMood('observing');
    } else {
      setSpeechText('أنت في وضع الإدارة الحرة. استمتع بتجربة محرك جانت بروجكت الكامل!');
      setCurrentMood('idle');
    }
  }, [selectedTask, profile.currentStage, profile.studentName, currentStepIndex, message, mood]);

  // Preload all 4 mascot state assets for instant mood transitions
  useEffect(() => {
    const assets = [
      '/assets/gant-bee/gant-bee-idle.webp',
      '/assets/gant-bee/gant-bee-friendly.webp',
      '/assets/gant-bee/gant-bee-guide.webp',
      '/assets/gant-bee/gant-bee-success.webp',
      '/assets/gant-bee/gant-bee-head.webp',
    ];
    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28 sm:w-32 sm:h-32',
    lg: 'w-36 h-36 sm:w-40 sm:h-40',
  }[size];

  // Determine correct official GANT Bee webp asset based on mood
  const assetSrc = getMascotAsset(currentMood);

  return (
    <div className={`relative flex flex-col items-center select-none group ${className}`}>
      {/* 2.5D Mascot Avatar Image Container */}
      <div
        className={`relative ${sizeClasses} flex items-center justify-center transition-transform duration-500 ${
          isAnimating ? 'animate-hover' : ''
        }`}
        style={{
          filter:
            'drop-shadow(0 10px 18px rgba(32, 42, 68, 0.28)) drop-shadow(0 2px 6px rgba(245, 197, 66, 0.22))',
        }}
      >
        <img
          src={assetSrc}
          alt="نحلة جانت (المساعد الذكي)"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none select-none transition-opacity duration-300"
        />

        {/* 2.5D Status Badge with Brand Styling (#202A44 Navy, #F5C542 Gold) */}
        <div className="absolute -bottom-2 bg-[#202A44] text-[#F5C542] text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-md border border-[#F5C542]/60 flex items-center gap-1.5 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>GANT Bee</span>
        </div>
      </div>

      {/* 2.5D Dimensional Contact Shadow */}
      <div
        className={`w-16 h-2 bg-[#202A44]/20 rounded-full blur-[2px] transition-all duration-500 mt-1 ${
          isAnimating ? 'animate-shadow' : ''
        }`}
        style={{ transformOrigin: 'center' }}
      />

      {/* Speech Bubble / Message Box */}
      {!hideBubble && (
        <div className="mt-2.5 max-w-xs bg-white border border-[#CBD5E1] rounded-xs p-2.5 shadow-lg text-[#1E293B] text-xs relative text-right">
          {/* Little pointer triangle */}
          <div className="absolute -top-2 right-12 w-3 h-3 bg-white border-t border-l border-[#CBD5E1] rotate-45" />

          <div className="font-bold text-[#0F172A] mb-0.5 flex items-center justify-between text-[11px]">
            <span>نحلة جانت التعليمية</span>
            <span className="text-[9px] text-[#2563EB] font-mono">
              {currentMood === 'pointing' || currentMood === 'guiding'
                ? 'إرشاد مباشر'
                : currentMood === 'success'
                ? 'إنجاز رائع'
                : 'المساعد الذكي'}
            </span>
          </div>

          <p className="text-[#334155] leading-relaxed text-[11px] mb-2">
            {speechText}
          </p>

          {onActionClick && actionLabel && (
            <button
              onClick={onActionClick}
              className="w-full py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xs text-[11px] transition-colors shadow-xs cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}

      {/* CSS Keyframes for 2.5D Hover & Ground Shadow Animations */}
      <style>{`
        @keyframes hover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(0.82); opacity: 0.12; }
        }
        .animate-hover {
          animation: hover 3.2s ease-in-out infinite;
        }
        .animate-shadow {
          animation: shadowPulse 3.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Export mood asset resolver for testability & reuse
export const getMascotAsset = (m: MascotMood) => {
  switch (m) {
    case 'idle':
    case 'observing':
      return '/assets/gant-bee/gant-bee-idle.webp';
    case 'friendly':
    case 'waiting_for_user':
    case 'detecting':
      return '/assets/gant-bee/gant-bee-friendly.webp';
    case 'guiding':
    case 'pointing':
    case 'correction':
      return '/assets/gant-bee/gant-bee-guide.webp';
    case 'success':
      return '/assets/gant-bee/gant-bee-success.webp';
    default:
      return '/assets/gant-bee/gant-bee-idle.webp';
  }
};

