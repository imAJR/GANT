/**
 * GANT — Contextual AI & Pedagogical Assistant Panel ("نحلة جانت")
 * Fully integrated interactive chat panel with Gemini 3.8 Flash / local fallback,
 * suggested pedagogical questions, real-time project validation, and dynamic tool highlighting.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Send,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { askGanttBeeAssistant, ChatMessage, AssistantAction, AssistantConnectionStatus } from '../../services/geminiAssistant';
import { GanttBeeAssistant, getMascotAsset } from './GanttBeeAssistant';
import { TUTORIAL_STEPS, STAGE_2_OBJECTIVES } from '../../data/tutorialSteps';

interface BeeAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTaskProps?: () => void;
  onOpenProjectProps?: () => void;
  onOpenResources?: () => void;
  onOpenStepModal?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'كيف أضيف مهمة جديدة؟',
  'لماذا تغير تاريخ انتهاء هذه المهمة؟',
  'كيف أجعل مهمة فرعية تابعة لمهمة رئيسية (Indent)؟',
  'ما الفرق بين علاقات FS وSS وFF وSF؟',
  'كيف أخصص مورداً بشرياً لمهمة؟',
  'ما المطلوب مني لإكمال المرحلة الحالية؟',
  'لماذا لم يعتبر البرنامج الخطوة التعليمية مكتملة؟',
  'أين أجد الأداة التي أحتاج إليها؟',
];

export const BeeAssistantPanel: React.FC<BeeAssistantPanelProps> = ({
  isOpen,
  onClose,
  onOpenTaskProps,
  onOpenProjectProps,
  onOpenResources,
  onOpenStepModal,
}) => {
  const { state, computedTasks, profile, viewSettings, advanceTutorialStep } = useProject();
  const [activeTab, setActiveTab] = useState<'chat' | 'validation' | 'curriculum'>('chat');

  const selectedTask = computedTasks.find((t) => t.id === viewSettings.selectedTaskId) || null;
  const [connectionStatus, setConnectionStatus] = useState<AssistantConnectionStatus>('local_fallback');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: `أهلاً بك يا ${profile.studentName || 'صديقي'}! 🐝\n\nأنا **نحلة جانت**، مساعدك الذكي ومدرّبك التفاعلي لمادة التقنية الرقمية 3 (الوحدة الأولى: تخطيط المشروعات).\n\nيمكنك سؤالي عن أي شيء في البرنامج أو المنهج، أو النقر على الأسئلة المقترحة أدناه لاستكشاف الإجابات فوراً!`,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          id: 'act-intro-step',
          label: 'عرض متطلبات الخطوة الحالية 🧭',
          actionType: 'open_step_modal',
        },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    if (isThinking) return;
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsThinking(true);

    try {
      const historyForAI = messages.map((m) => ({ role: m.role, text: m.text }));
      const response = await askGanttBeeAssistant(textToSend, historyForAI, {
        profile,
        state,
        computedTasks,
        selectedTask,
      });

      setConnectionStatus(response.source === 'cloud' ? 'cloud_connected' : 'local_fallback');

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        actions: response.actions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: 'عذراً، حدث خطأ بسيط أثناء معالجة استفسارك. أنا هنا دائماً لمساعدتك في المنهج!',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleActionClick = (action: AssistantAction) => {
    switch (action.actionType) {
      case 'open_task_props':
        onOpenTaskProps?.();
        break;
      case 'open_project_props':
        onOpenProjectProps?.();
        break;
      case 'open_resources':
        onOpenResources?.();
        break;
      case 'open_step_modal':
        onOpenStepModal?.();
        break;
      case 'next_step':
        advanceTutorialStep();
        break;
      case 'highlight':
        // Highlight action can be dispatched or notified
        break;
      default:
        break;
    }
  };

  // Validation calculations
  const directingTask = computedTasks.find((t) => t.id === 'task_directing' || t.name.includes('الإخراج'));
  const directingChildren = directingTask?.childrenIds?.map((id) =>
    computedTasks.find((t) => t.id === id)?.name
  ) || [];
  const hasDirectingSummary = !!(directingTask && directingTask.hasChildren && directingTask.summary);
  const hasSubtasksExpected =
    directingChildren.some((n) => n?.includes('الموسيقى')) &&
    directingChildren.some((n) => n?.includes('المشهد')) &&
    directingChildren.some((n) => n?.includes('الأزياء'));

  const castReadingDep = state.dependencies.find((d) => {
    const pred = state.tasks.find((t) => t.id === d.predecessorId);
    const succ = state.tasks.find((t) => t.id === d.successorId);
    return pred?.name.includes('طاقم التمثيل') && succ?.name.includes('قراءة السيناريو') && d.type === 'FS';
  });

  const dressRehearsalTask = computedTasks.find(
    (t) => t.id === 'task_dress_rehearsal' || t.name.includes('بروفات اللباس')
  );
  const hasDressMilestone = !!(dressRehearsalTask && dressRehearsalTask.milestone);
  const hasWeekendFriSat =
    state.project.weekendDays.includes(5) && state.project.weekendDays.includes(6);

  const validationItems = [
    {
      title: 'الإخراج مهمة تلخيصية (Summary Task)',
      desc: 'تحتوي على المهام الفرعية: الموسيقى، المشهد، الأزياء.',
      passed: hasDirectingSummary && hasSubtasksExpected,
      details: hasDirectingSummary ? `المهام التابعة: ${directingChildren.join('، ')}` : 'ليست مهمة تلخيصية حالياً.',
    },
    {
      title: 'تبعية طاقم التمثيل → قراءة السيناريو (FS)',
      desc: 'علاقة الانتهاء للبدء برابط قوي.',
      passed: !!castReadingDep,
      details: castReadingDep ? 'الرابط موجود بنجاح' : 'الرابط غير موجود.',
    },
    {
      title: 'بروفات اللباس معلم رئيسي (Milestone)',
      desc: 'معلم رئيسي بمدة 0 يوم وبرمز معين ◆.',
      passed: hasDressMilestone,
      details: hasDressMilestone ? 'محدد كمعلم رئيسي' : 'المهمة ليست معلماً رئيسياً.',
    },
    {
      title: 'تقويم عطلة نهاية الأسبوع (الجمعة والسبت)',
      desc: 'استبعاد يومي الجمعة والسبت من حساب أيام العمل.',
      passed: hasWeekendFriSat,
      details: hasWeekendFriSat ? 'التقويم متوافق مع المنهج' : 'تغيرت أيام العطلة في الخصائص.',
    },
  ];

  const totalPassed = validationItems.filter((i) => i.passed).length;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-[440px] bg-[#ECEFF3] border-r border-[#718096] shadow-2xl flex flex-col text-[#1E293B] text-xs">
      {/* Desktop Window Header */}
      <div className="px-4 py-2.5 bg-[#DFE3E8] border-b border-[#CBD5E1] flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-[#202A44] bg-white flex items-center justify-center p-0.5 shadow-xs overflow-hidden shrink-0">
            <img
              src="/assets/gant-bee/gant-bee-head.webp"
              alt="نحلة جانت"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
              <span>نحلة جانت (المساعد الذكي)</span>
              <span className="text-[10px] text-[#2563EB] bg-[#E2E8F0] border border-[#CBD5E1] px-1.5 py-0.2 rounded font-mono font-bold">
                Gemini 3.8 Flash
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#64748B]">
                التقنية الرقمية 3
              </span>
              {connectionStatus === 'cloud_connected' ? (
                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  متصل بالسحابة ☁️
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  الردود المحلية 🐝
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center text-[#475569] hover:bg-[#EF4444] hover:text-white rounded-xs transition-colors cursor-pointer text-xs font-bold"
          title="إغلاق"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#CBD5E1] bg-[#DFE3E8] px-3 pt-1.5 gap-1 select-none">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-1.5 px-3 font-semibold transition-colors border-t border-x rounded-t text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
              : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#E2E6EA]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>محادثة ذكية 💬</span>
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`pb-1.5 px-3 font-semibold transition-colors border-t border-x rounded-t text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'validation'
              ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
              : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#E2E6EA]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>فحص المشروع ({totalPassed}/{validationItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`pb-1.5 px-3 font-semibold transition-colors border-t border-x rounded-t text-xs flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-white border-[#CBD5E1] text-[#0F172A]'
              : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#E2E6EA]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>المفاهيم 📚</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-white">
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat messages list */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-[#F8FAFC]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-xs overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-[#2563EB] text-white border-[#1D4ED8]'
                        : 'bg-white border-[#F5C542] p-0.5'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <img
                        src="/assets/gant-bee/gant-bee-head.webp"
                        alt="نحلة جانت"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  <div
                    className={`max-w-[82%] rounded-lg p-2.5 space-y-2 text-xs leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-[#2563EB] text-white rounded-tl-none'
                        : 'bg-white text-[#1E293B] border border-[#CBD5E1] rounded-tr-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-1.5">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => handleActionClick(act)}
                            className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] px-2 py-1 rounded font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[9px] text-right font-mono ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-[#94A3B8]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-[#64748B] text-xs py-2">
                  <div className="w-6 h-6 rounded-full bg-white border border-[#F5C542] flex items-center justify-center overflow-hidden p-0.5 animate-bounce shrink-0 shadow-xs">
                    <img
                      src="/assets/gant-bee/gant-bee-head.webp"
                      alt="نحلة جانت تفكر"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span>نحلة جانت تفكر في الإجابة وتربطها بمشروعك...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question Pills */}
            <div className="p-2 bg-[#ECEFF3] border-t border-[#CBD5E1] overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
              {SUGGESTED_QUESTIONS.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sq)}
                  className="bg-white hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] px-2.5 py-1 rounded-full text-[10px] shrink-0 font-medium transition-colors cursor-pointer shadow-xs"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-2.5 bg-[#DFE3E8] border-t border-[#CBD5E1] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendMessage();
                  }
                }}
                placeholder="اسأل نحلة جانت عن أي شيء في المشروع أو المنهج..."
                className="flex-1 bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>إرسال</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="p-4 space-y-3.5 overflow-y-auto">
            {/* Mascot Validation Header Banner */}
            <div className="p-3 bg-gradient-to-r from-blue-50/70 to-emerald-50/70 rounded border border-[#CBD5E1] flex items-center gap-3">
              <GanttBeeAssistant
                mood={totalPassed === validationItems.length ? 'success' : 'pointing'}
                size="sm"
                hideBubble={true}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0 text-right">
                <div className="font-bold text-xs text-[#0F172A]">
                  {totalPassed === validationItems.length
                    ? 'المشروع مستوفٍ لجميع معايير المنهج 🎉'
                    : 'فحص معايير المنهج في مشروعك'}
                </div>
                <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                  {totalPassed === validationItems.length
                    ? 'ممتاز! جميع المعايير الأساسية لمنهج التقنية الرقمية 3 محققة بالكامل.'
                    : `تم إنجاز ${totalPassed} من أصل ${validationItems.length} معايير. راجع المعايير أدناه لإتقانها.`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#0F172A] text-xs">
                  مطابقة سيناريو المسرحية المدرسية
                </span>
                <span className="font-mono text-[#2563EB] font-bold text-xs">
                  {Math.round((totalPassed / validationItems.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-xs overflow-hidden border border-[#CBD5E1]">
                <div
                  className="bg-[#2563EB] h-full transition-all duration-300"
                  style={{ width: `${(totalPassed / validationItems.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {validationItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded border transition-all text-xs ${
                    item.passed
                      ? 'bg-[#F0FDF4] border-[#86EFAC] text-[#14532D]'
                      : 'bg-[#FEFCE8] border-[#FDE047] text-[#713F12]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#CA8A04] shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-xs text-[#0F172A] flex items-center justify-between">
                        <span>{item.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            item.passed
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : 'bg-[#FEF08A] text-[#854D0E]'
                          }`}
                        >
                          {item.passed ? 'مكتمل' : 'يحتاج ضبط'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#475569] mt-0.5">{item.desc}</p>
                      <div className="mt-1 text-[10px] text-[#64748B] font-mono">
                        {item.details}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#CBD5E1] text-[11px] text-[#475569] flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                تتيح لك أزرار شريط الأدوات ضبط أي من هذه المعايير وملاحظة التغير الفوري في المخطط.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="p-4 space-y-3.5 overflow-y-auto">
            {/* Mascot Curriculum Header Banner */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded border border-[#CBD5E1]">
              <GanttBeeAssistant mood="guiding" size="sm" hideBubble={true} className="shrink-0" />
              <div className="text-right">
                <h3 className="font-bold text-xs text-[#0F172A]">المرشد المعرفي لمقرر التقنية الرقمية 3</h3>
                <p className="text-[11px] text-[#475569] leading-relaxed mt-0.5">
                  أهم المفاهيم النظرية والعملية في تخطيط المشروعات متوافقة مع منهج الوزارة ومحاكي جانت بروجكت.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] space-y-1">
              <h4 className="font-bold text-[#0F172A] text-xs">1. ما هو مخطط جانت (Gantt Chart)؟</h4>
              <p className="text-[#334155] leading-relaxed text-[11px]">
                تمثيل بياني شريطي يُظهر الجدول الزمني للمشروع. يمثل المحور الأفقي خط الأيام والأسابيع، ويمثل المحور الرأسي قائمة المهام.
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] space-y-1">
              <h4 className="font-bold text-[#0F172A] text-xs">2. المهام التلخيصية (Summary Tasks)</h4>
              <p className="text-[#334155] leading-relaxed text-[11px]">
                مهمة تجمع تحتها مهام فرعية (مثل مهمة <strong>الإخراج</strong> التي تضم: الموسيقى، المشهد، الأزياء). يتم إنشاؤها عبر زر تقديم المسافة البادئة (Indent).
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] space-y-1">
              <h4 className="font-bold text-[#0F172A] text-xs">3. المعالم الرئيسية (Milestones)</h4>
              <p className="text-[#334155] leading-relaxed text-[11px]">
                حدث مهم أو مرحلة فارقة لا تستغرق وقتاً عملياً (مدتها 0 يوم). تمثل في جانت برمز معين ◆ مثل مهمة <strong>بروفات اللباس</strong>.
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#CBD5E1] space-y-1">
              <h4 className="font-bold text-[#0F172A] text-xs">4. أنواع التبعيات الأربعة (Dependencies)</h4>
              <ul className="text-[#334155] space-y-1 text-[11px] list-disc list-inside">
                <li><strong>FS (الانتهاء للبدء):</strong> لا تبدأ اللاحقة إلا بعد اكتمال السابقة.</li>
                <li><strong>SS (البدء للبدء):</strong> تبدأ المهمتان معاً.</li>
                <li><strong>FF (الانتهاء للانتهاء):</strong> تنتهي المهمتان معاً.</li>
                <li><strong>SF (البدء للانتهاء):</strong> تنتهي اللاحقة عند بدء السابقة.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-[#DFE3E8] border-t border-[#CBD5E1] text-center text-[10px] text-[#64748B] select-none">
        GANT Bee AI — مدعوم بنموذج Google Gemini 3.8 Flash (2026)
      </div>
    </div>
  );
};
