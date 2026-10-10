/**
 * GANT — Application Toolbar (GanttProject Desktop Style)
 * Authentic desktop project management toolstrip with Educational Highlighting.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React from 'react';
import {
  Save,
  Undo2,
  Redo2,
  Plus,
  Trash2,
  Indent,
  Outdent,
  Sliders,
  Settings,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Diamond,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface ToolbarProps {
  onOpenProjectProps: () => void;
  onOpenTaskProps: () => void;
  onOpenResources: () => void;
  onOpenAssistant: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenProjectProps,
  onOpenTaskProps,
  onOpenAssistant,
}) => {
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    saveProject,
    addTask,
    deleteTask,
    indentTask,
    unindentTask,
    moveTaskUp,
    moveTaskDown,
    toggleMilestone,
    autoSchedule,
    viewSettings,
    setViewSettings,
    activeHighlightTargetId,
  } = useProject();

  const selectedTaskId = viewSettings.selectedTaskId;

  return (
    <div className="bg-[#F1F3F5] border-b border-[#CBD5E1] px-2 py-1 flex items-center justify-between text-[#1E293B] text-xs select-none shadow-xs">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Persistence & History Group */}
        <div className="flex items-center gap-0.5 pl-1.5 border-l border-[#CBD5E1]">
          <button
            onClick={saveProject}
            title="حفظ المشروع (Ctrl+S)"
            className="p-1 rounded hover:bg-[#E2E8F0] active:bg-[#CBD5E1] transition-colors flex items-center gap-1 text-[#1E293B]"
          >
            <Save className="w-4 h-4 text-[#059669]" />
          </button>

          <button
            onClick={undo}
            disabled={!canUndo}
            title="تراجع (Ctrl+Z)"
            className={`p-1 rounded transition-colors ${
              canUndo ? 'hover:bg-[#E2E8F0] text-[#1E293B]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            title="إعادة (Ctrl+Y)"
            className={`p-1 rounded transition-colors ${
              canRedo ? 'hover:bg-[#E2E8F0] text-[#1E293B]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Task Manipulation Group */}
        <div className="flex items-center gap-0.5 px-1.5 border-l border-[#CBD5E1]">
          <button
            id="btn-new-task"
            onClick={() => addTask(selectedTaskId)}
            title="مهمة جديدة"
            className={`p-1 rounded transition-all flex items-center gap-1 font-medium ${
              activeHighlightTargetId === 'btn-new-task'
                ? 'bg-amber-100 text-blue-700 ring-2 ring-amber-500 animate-pulse font-bold'
                : 'hover:bg-[#E2E8F0] text-[#2563EB]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">مهمة جديدة</span>
          </button>

          <button
            id="btn-delete-task"
            onClick={() => selectedTaskId && deleteTask(selectedTaskId)}
            disabled={!selectedTaskId}
            title="حذف المهمة"
            className={`p-1 rounded transition-colors ${
              selectedTaskId ? 'hover:bg-[#E2E8F0] text-red-600' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-[#CBD5E1] mx-0.5" />

          <button
            id="btn-indent"
            onClick={() => selectedTaskId && indentTask(selectedTaskId)}
            disabled={!selectedTaskId}
            title="تقديم المسافة البادئة (مهمة فرعية)"
            className={`p-1 rounded transition-all ${
              activeHighlightTargetId === 'btn-indent'
                ? 'bg-amber-100 text-blue-700 ring-2 ring-amber-500 animate-pulse font-bold'
                : selectedTaskId ? 'hover:bg-[#E2E8F0] text-[#2563EB]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Indent className="w-4 h-4" />
          </button>

          <button
            id="btn-outdent"
            onClick={() => selectedTaskId && unindentTask(selectedTaskId)}
            disabled={!selectedTaskId}
            title="تأخير المسافة البادئة (مهمة رئيسية)"
            className={`p-1 rounded transition-colors ${
              selectedTaskId ? 'hover:bg-[#E2E8F0] text-[#2563EB]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Outdent className="w-4 h-4" />
          </button>

          <button
            onClick={() => selectedTaskId && moveTaskUp(selectedTaskId)}
            disabled={!selectedTaskId}
            title="تحريك لأعلى"
            className={`p-1 rounded transition-colors ${
              selectedTaskId ? 'hover:bg-[#E2E8F0] text-[#1E293B]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#475569]" />
          </button>

          <button
            onClick={() => selectedTaskId && moveTaskDown(selectedTaskId)}
            disabled={!selectedTaskId}
            title="تحريك لأسفل"
            className={`p-1 rounded transition-colors ${
              selectedTaskId ? 'hover:bg-[#E2E8F0] text-[#1E293B]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-[#475569]" />
          </button>

          <button
            id="btn-milestone"
            onClick={() => selectedTaskId && toggleMilestone(selectedTaskId)}
            disabled={!selectedTaskId}
            title="معلم رئيسي (Milestone)"
            className={`p-1 rounded transition-all ${
              activeHighlightTargetId === 'btn-milestone'
                ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500 animate-pulse font-bold'
                : selectedTaskId ? 'hover:bg-[#E2E8F0] text-amber-600' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Diamond className="w-4 h-4 text-amber-600 fill-amber-500/30" />
          </button>

          <button
            id="btn-task-props"
            onClick={onOpenTaskProps}
            disabled={!selectedTaskId}
            title="خصائص المهمة"
            className={`p-1 rounded transition-all flex items-center gap-1 ${
              activeHighlightTargetId === 'btn-task-props'
                ? 'bg-amber-100 text-[#0284C7] ring-2 ring-amber-500 animate-pulse font-bold'
                : selectedTaskId ? 'hover:bg-[#E2E8F0] text-[#0F172A]' : 'opacity-35 cursor-not-allowed text-[#94A3B8]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#0284C7]" />
            <span className="hidden md:inline text-[11px]">خصائص</span>
          </button>
        </div>

        {/* Project & Scheduling Group */}
        <div className="flex items-center gap-0.5 px-1.5 border-l border-[#CBD5E1]">
          <button
            id="btn-project-props"
            onClick={onOpenProjectProps}
            title="خصائص المشروع وتقويم الأسبوع"
            className={`p-1 rounded transition-all flex items-center gap-1 ${
              activeHighlightTargetId === 'btn-project-props'
                ? 'bg-amber-100 text-purple-700 ring-2 ring-amber-500 animate-pulse font-bold'
                : 'hover:bg-[#E2E8F0] text-[#1E293B]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#7C3AED]" />
            <span className="hidden lg:inline text-[11px]">خصائص المشروع</span>
          </button>

          <button
            id="btn-autoschedule"
            onClick={autoSchedule}
            title="جدولة تلقائية استناداً للتبعيات وعطلات الأسبوع"
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#1E293B] transition-colors flex items-center gap-1"
          >
            <RotateCw className="w-4 h-4 text-[#D97706]" />
            <span className="hidden xl:inline text-[11px]">جدولة تلقائية</span>
          </button>
        </div>

        {/* Zoom Controls Group */}
        <div className="flex items-center gap-1 px-1.5 border-l border-[#CBD5E1]">
          <button
            onClick={() =>
              setViewSettings((prev) => ({
                ...prev,
                zoomLevel: prev.zoomLevel === 'month' ? 'week' : 'day',
              }))
            }
            title="تكبير المخطط"
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#1E293B] transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setViewSettings((prev) => ({
                ...prev,
                zoomLevel: prev.zoomLevel === 'day' ? 'week' : 'month',
              }))
            }
            title="تصغير المخطط"
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#1E293B] transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mascot Assistant & Stages Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition-all cursor-pointer shadow-xs"
          title="افتح المساعد التعليمي (نحلة جانت)"
        >
          <div className="w-5 h-5 rounded-full border border-amber-600 bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0 shadow-xs">
            <img
              src="/assets/gant-bee/gant-bee-head.webp"
              alt="نحلة جانت"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[11px] font-bold">
            مساعد جانت
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>
    </div>
  );
};
