/**
 * GANT — Top Menu Bar (GanttProject Desktop Style)
 * Authentic desktop project management menu bar.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  Save,
  RotateCcw,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Indent,
  Outdent,
  Sliders,
  Users,
  Settings,
  HelpCircle,
  FileDown,
  FileUp,
  RotateCw,
  Sparkles,
  Maximize2,
  Calendar,
  Layers,
  ChevronDown,
  Grid,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface TopMenuProps {
  onOpenProjectProps: () => void;
  onOpenTaskProps: () => void;
  onOpenResources: () => void;
  onOpenAssistant: () => void;
  onOpenAbout: () => void;
  onOpenTour: () => void;
}

export const TopMenu: React.FC<TopMenuProps> = ({
  onOpenProjectProps,
  onOpenTaskProps,
  onOpenResources,
  onOpenAssistant,
  onOpenAbout,
  onOpenTour,
}) => {
  const {
    state,
    profile,
    setAppScreen,
    canUndo,
    canRedo,
    undo,
    redo,
    saveProject,
    resetToEducationalScenario,
    resetStudentProgress,
    exportProjectJSON,
    importProjectJSON,
    viewSettings,
    setViewSettings,
    addTask,
    deleteTask,
    indentTask,
    unindentTask,
    toggleMilestone,
    autoSchedule,
  } = useProject();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        if (canRedo) redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, saveProject]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importProjectJSON(content);
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
    setActiveMenu(null);
  };

  const selectedTaskId = viewSettings.selectedTaskId;

  return (
    <div
      ref={menuBarRef}
      className="bg-[#E4E7EB] border-b border-[#CBD5E1] text-[#1E293B] text-xs px-2 select-none flex items-center justify-between z-30 h-7"
    >
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      <div className="flex items-center space-x-1 space-x-reverse">
        {/* Brand Lockup (GanttProject Desktop inspired) */}
        <div className="flex items-center gap-1.5 pl-3 pr-2 py-0.5 border-l border-[#CBD5E1]">
          <span className="font-extrabold text-[#0F172A] tracking-tight font-mono text-[13px]">GANT</span>
          <span className="text-[11px] text-[#2563EB] font-bold">جانت</span>
        </div>

        {/* Project Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'project' ? null : 'project')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMenu === 'project' ? 'bg-[#CBD5E1] text-[#0F172A] font-semibold' : 'hover:bg-[#D5D9E0] text-[#1E293B]'
            }`}
          >
            مشروع {viewSettings.showEnglishTerms && <span className="text-[10px] text-neutral-500 font-mono">(Project)</span>}
          </button>
          {activeMenu === 'project' && (
            <div className="absolute right-0 top-full mt-0.5 w-64 bg-white border border-[#94A3B8] rounded shadow-xl py-1 z-50 text-[#1E293B]">
              <button
                onClick={() => {
                  onOpenProjectProps();
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>خصائص المشروع...</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+P</span>
              </button>

              <button
                onClick={() => {
                  saveProject();
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>حفظ المشروع محلياً</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+S</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                onClick={() => {
                  exportProjectJSON();
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center gap-2 text-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-[#64748B]" />
                <span>تصدير ملف المشروع (JSON)</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center gap-2 text-xs"
              >
                <FileUp className="w-3.5 h-3.5 text-[#64748B]" />
                <span>استيراد ملف مشروع...</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                onClick={() => {
                  resetToEducationalScenario();
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-amber-50 text-amber-700 flex items-center gap-2 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>إعادة ضبط المشروع الحالي (المسرحية المدرسية)</span>
              </button>

              <button
                onClick={() => {
                  setShowResetConfirmModal(true);
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                <span>إعادة ضبط التقدم التعليمي والمراحل...</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMenu === 'edit' ? 'bg-[#CBD5E1] text-[#0F172A] font-semibold' : 'hover:bg-[#D5D9E0] text-[#1E293B]'
            }`}
          >
            تعديل {viewSettings.showEnglishTerms && <span className="text-[10px] text-neutral-500 font-mono">(Edit)</span>}
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute right-0 top-full mt-0.5 w-56 bg-white border border-[#94A3B8] rounded shadow-xl py-1 z-50 text-[#1E293B]">
              <button
                disabled={!canUndo}
                onClick={() => {
                  undo();
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center justify-between text-xs ${
                  canUndo ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Undo2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>تراجع</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+Z</span>
              </button>

              <button
                disabled={!canRedo}
                onClick={() => {
                  redo();
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center justify-between text-xs ${
                  canRedo ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Redo2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>إعادة</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">Ctrl+Y</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                disabled={!selectedTaskId}
                onClick={() => {
                  if (selectedTaskId) deleteTask(selectedTaskId);
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center gap-2 text-xs ${
                  selectedTaskId ? 'hover:bg-red-50 text-red-600' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المهمة المحددة</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMenu === 'view' ? 'bg-[#CBD5E1] text-[#0F172A] font-semibold' : 'hover:bg-[#D5D9E0] text-[#1E293B]'
            }`}
          >
            عرض {viewSettings.showEnglishTerms && <span className="text-[10px] text-neutral-500 font-mono">(View)</span>}
          </button>
          {activeMenu === 'view' && (
            <div className="absolute right-0 top-full mt-0.5 w-60 bg-white border border-[#94A3B8] rounded shadow-xl py-1 z-50 text-[#1E293B]">
              <button
                onClick={() => {
                  setViewSettings((prev) => ({
                    ...prev,
                    showDependencies: !prev.showDependencies,
                  }));
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <span>إظهار خطوط التبعيات</span>
                <span className="text-[10px] font-semibold text-blue-600">{viewSettings.showDependencies ? 'مفعّل' : 'معطّل'}</span>
              </button>

              <button
                onClick={() => {
                  setViewSettings((prev) => ({
                    ...prev,
                    showWeekendHighlight: !prev.showWeekendHighlight,
                  }));
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <span>تمييز عطلة نهاية الأسبوع</span>
                <span className="text-[10px] font-semibold text-blue-600">{viewSettings.showWeekendHighlight ? 'مفعّل' : 'معطّل'}</span>
              </button>

              <button
                onClick={() => {
                  setViewSettings((prev) => ({
                    ...prev,
                    showTodayLine: !prev.showTodayLine,
                  }));
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs"
              >
                <span>مؤشر تاريخ اليوم</span>
                <span className="text-[10px] font-semibold text-blue-600">{viewSettings.showTodayLine ? 'مفعّل' : 'معطّل'}</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                onClick={() => {
                  setViewSettings((prev) => ({
                    ...prev,
                    language: prev.language === 'en' ? 'ar' : 'en',
                    showEnglishTerms: prev.language === 'ar',
                  }));
                  setActiveMenu(null);
                }}
                className="w-full text-start px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs cursor-pointer"
              >
                <span>لغة الواجهة (Language / Direction)</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {viewSettings.language === 'en' ? 'English (LTR)' : 'العربية (RTL)'}
                </span>
              </button>

              <button
                onClick={() => {
                  setViewSettings((prev) => ({
                    ...prev,
                    showEnglishTerms: !prev.showEnglishTerms,
                  }));
                  setActiveMenu(null);
                }}
                className="w-full text-start px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center justify-between text-xs cursor-pointer"
              >
                <span>عرض المصطلحات الإنجليزية</span>
                <span className="text-[10px] text-neutral-500">{viewSettings.showEnglishTerms ? 'مفعّل' : 'معطّل'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tasks Menu */}
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === 'tasks' ? null : 'tasks')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeMenu === 'tasks' ? 'bg-[#CBD5E1] text-[#0F172A] font-semibold' : 'hover:bg-[#D5D9E0] text-[#1E293B]'
            }`}
          >
            مهام {viewSettings.showEnglishTerms && <span className="text-[10px] text-neutral-500 font-mono">(Tasks)</span>}
          </button>
          {activeMenu === 'tasks' && (
            <div className="absolute right-0 top-full mt-0.5 w-60 bg-white border border-[#94A3B8] rounded shadow-xl py-1 z-50 text-[#1E293B]">
              <button
                onClick={() => {
                  addTask(selectedTaskId);
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center gap-2 text-xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>مهمة جديدة</span>
              </button>

              <button
                disabled={!selectedTaskId}
                onClick={() => {
                  onOpenTaskProps();
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center gap-2 text-xs ${
                  selectedTaskId ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#64748B]" />
                <span>خصائص المهمة المحددة...</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                disabled={!selectedTaskId}
                onClick={() => {
                  if (selectedTaskId) indentTask(selectedTaskId);
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center gap-2 text-xs ${
                  selectedTaskId ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <Indent className="w-3.5 h-3.5 text-[#64748B]" />
                <span>تقديم المسافة البادئة (مهمة فرعية)</span>
              </button>

              <button
                disabled={!selectedTaskId}
                onClick={() => {
                  if (selectedTaskId) unindentTask(selectedTaskId);
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center gap-2 text-xs ${
                  selectedTaskId ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <Outdent className="w-3.5 h-3.5 text-[#64748B]" />
                <span>تأخير المسافة البادئة (مهمة رئيسية)</span>
              </button>

              <button
                disabled={!selectedTaskId}
                onClick={() => {
                  if (selectedTaskId) toggleMilestone(selectedTaskId);
                  setActiveMenu(null);
                }}
                className={`w-full text-right px-3 py-1.5 flex items-center gap-2 text-xs ${
                  selectedTaskId ? 'hover:bg-[#E2E8F0]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-amber-600 text-xs">◆</span>
                <span>تحويل إلى معلم رئيسي (Milestone)</span>
              </button>

              <div className="my-1 border-t border-[#E2E8F0]" />

              <button
                onClick={() => {
                  autoSchedule();
                  setActiveMenu(null);
                }}
                className="w-full text-right px-3 py-1.5 hover:bg-[#E2E8F0] flex items-center gap-2 text-xs text-blue-700"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>جدولة تلقائية وفق التبعيات</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Stage Navigation & Student Profile Tag */}
      <div className="flex items-center gap-3 text-[11px]">
        <button
          onClick={() => setAppScreen('stage_select')}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#1E293B] shadow-xs cursor-pointer font-medium"
          title="العودة لاختيار المرحلة"
        >
          <Grid className="w-3 h-3 text-[#2563EB]" />
          <span>المراحل</span>
          <span className="bg-blue-100 text-blue-700 text-[10px] px-1 rounded font-bold">
            م{profile.currentStage}
          </span>
        </button>

        <span className="text-[#94A3B8]">|</span>

        <span className="font-medium text-[#334155]">
          الطالب: <strong className="text-[#0F172A]">{profile.studentName || 'غير مسجل'}</strong>
        </span>
      </div>

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
    </div>
  );
};
