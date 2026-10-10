/**
 * GANT — Authentic GanttProject Desktop Task Table
 * Pixel-perfect row alignment (28px), synchronized scrolling,
 * keyboard navigation, and desktop context menu.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Diamond,
  Folder,
  FolderOpen,
  Sliders,
  Trash2,
  Indent,
  Outdent,
  Plus,
  ArrowUp,
  ArrowDown,
  GripVertical,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { PriorityLevel } from '../../types/project';

export const ROW_HEIGHT = 28; // Standard GanttProject row height in pixels
export const HEADER_HEIGHT = 48; // Standard GanttProject two-tier header height in pixels

interface TaskTableProps {
  onOpenTaskProps: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  onOpenTaskProps,
  scrollRef,
  onScroll,
}) => {
  const {
    state,
    computedTasks,
    viewSettings,
    selectTask,
    selectNextTask,
    selectPrevTask,
    toggleCollapseTask,
    updateTask,
    deleteTask,
    indentTask,
    unindentTask,
    moveTaskUp,
    moveTaskDown,
    toggleMilestone,
    addTask,
    reorderTasks,
    activeTargetTaskId,
  } = useProject();

  const [editingField, setEditingField] = useState<{ taskId: string; field: string } | null>(null);

  // Drag-and-drop row reordering
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  // Desktop right-click context menu
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    taskId: string;
  } | null>(null);

  const selectedTaskId = viewSettings.selectedTaskId;
  const collapsedIds = viewSettings.collapsedTaskIds;
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tasks based on parent collapse state
  const visibleTasks = computedTasks.filter((task) => {
    let currParentId = task.parentId;
    while (currParentId) {
      if (collapsedIds.includes(currParentId)) return false;
      const parentTask = computedTasks.find((t) => t.id === currParentId);
      currParentId = parentTask?.parentId || null;
    }
    return true;
  });

  // Close context menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Keyboard navigation on task table
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      // Only handle if not actively editing an input and target is not an input/textarea
      if (editingField) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectNextTask();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectPrevTask();
      } else if (e.key === 'Enter') {
        if (selectedTaskId) {
          e.preventDefault();
          onOpenTaskProps();
        }
      } else if (e.key === 'Delete') {
        if (selectedTaskId) {
          e.preventDefault();
          deleteTask(selectedTaskId);
        }
      } else if (e.key === 'Tab') {
        if (selectedTaskId) {
          e.preventDefault();
          if (e.shiftKey) {
            unindentTask(selectedTaskId);
          } else {
            indentTask(selectedTaskId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, editingField, selectNextTask, selectPrevTask, onOpenTaskProps, deleteTask, indentTask, unindentTask]);

  const getResourceNames = (taskId: string): string => {
    const assigned = state.assignments.filter((a) => a.taskId === taskId);
    if (assigned.length === 0) return '';
    return assigned
      .map((a) => state.resources.find((r) => r.id === a.resourceId)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getPredecessorsString = (taskId: string): string => {
    const deps = state.dependencies.filter((d) => d.successorId === taskId);
    if (deps.length === 0) return '';
    return deps
      .map((d) => {
        const predIndex = state.tasks.findIndex((t) => t.id === d.predecessorId);
        const predNum = predIndex >= 0 ? predIndex + 1 : '';
        return `${predNum}${d.type}`;
      })
      .join(', ');
  };

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    selectTask(taskId);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      taskId,
    });
  };

  const handleDragStart = (idx: number) => {
    setDraggedRowIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverRowIndex(idx);
  };

  const handleDrop = (destinationIdx: number) => {
    if (draggedRowIndex !== null && draggedRowIndex !== destinationIdx) {
      const sourceTask = visibleTasks[draggedRowIndex];
      const targetTask = visibleTasks[destinationIdx];
      if (sourceTask && targetTask) {
        const sourceIndexInState = state.tasks.findIndex((t) => t.id === sourceTask.id);
        const targetIndexInState = state.tasks.findIndex((t) => t.id === targetTask.id);
        if (sourceIndexInState !== -1 && targetIndexInState !== -1) {
          reorderTasks(sourceIndexInState, targetIndexInState);
        }
      }
    }
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-white border-l border-[#CBD5E1] text-[#1E293B] text-[12px] select-none overflow-hidden relative"
      tabIndex={0}
    >
      {/* Scrollable Container (with synchronized scroll ref) */}
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        onScroll={onScroll}
        className="flex-1 overflow-auto outline-none"
      >
        <table className="w-full text-right border-collapse border-spacing-0 table-fixed">
          {/* Table Header: Exactly 48px height to align 1:1 with Gantt timeline header */}
          <thead className="sticky top-0 bg-[#E6E9ED] z-20 border-b border-[#B8C0CA] text-[11px] text-[#334155] shadow-xs">
            {/* Tier 1 Header */}
            <tr style={{ height: '24px' }} className="border-b border-[#CBD5E1] bg-[#DFE3E8] text-[#1E293B] font-bold">
              <th colSpan={2} className="px-2 text-right border-l border-[#CBD5E1]">
                قائمة مهام المشروع
              </th>
              <th colSpan={3} className="px-2 text-center border-l border-[#CBD5E1]">
                الجدول الزمني والمدد
              </th>
              <th colSpan={3} className="px-2 text-center">
                الارتباطات والمسؤوليات
              </th>
            </tr>

            {/* Tier 2 Header: Column definitions */}
            <tr style={{ height: '24px' }}>
              <th className="px-1 text-center w-9 font-mono font-bold border-l border-[#CBD5E1]">#</th>
              <th className="px-2 font-bold min-w-[200px] border-l border-[#CBD5E1]">اسم المهمة (Name)</th>
              <th className="px-1 text-center w-24 font-bold border-l border-[#CBD5E1]">البدء (Begin)</th>
              <th className="px-1 text-center w-24 font-bold border-l border-[#CBD5E1]">الانتهاء (End)</th>
              <th className="px-1 text-center w-14 font-bold border-l border-[#CBD5E1]">المدة</th>
              <th className="px-1 text-center w-16 font-bold border-l border-[#CBD5E1]">المهام السابقة</th>
              <th className="px-2 font-bold min-w-[110px] border-l border-[#CBD5E1]">الموارد</th>
              <th className="px-1 text-center w-16 font-bold">التقدم</th>
            </tr>
          </thead>

          {/* Table Body: Each row is EXACTLY 28px height */}
          <tbody className="divide-y divide-[#E2E8F0]">
            {visibleTasks.map((task, idx) => {
              const isSelected = task.id === selectedTaskId;
              const isTargeted = task.id === activeTargetTaskId;
              const hasChildren = task.hasChildren;
              const isCollapsed = collapsedIds.includes(task.id);
              const isEditingName = editingField?.taskId === task.id && editingField?.field === 'name';
              const isDragOver = dragOverRowIndex === idx;

              return (
                <tr
                  key={task.id}
                  id={`row-${task.id}`}
                  style={{ height: `${ROW_HEIGHT}px`, maxHeight: `${ROW_HEIGHT}px` }}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onClick={() => selectTask(task.id)}
                  onDoubleClick={() => {
                    selectTask(task.id);
                    onOpenTaskProps();
                  }}
                  onContextMenu={(e) => handleContextMenu(e, task.id)}
                  className={`group transition-none cursor-pointer box-border ${
                    isDragOver
                      ? 'border-t-2 border-t-[#2563EB] bg-[#EFF6FF]'
                      : isSelected
                      ? 'bg-[#CCE4F7] text-[#0F2F64] font-medium ring-1 ring-inset ring-[#2563EB]'
                      : isTargeted
                      ? 'bg-amber-100/80 border-r-4 border-r-amber-500 font-semibold'
                      : idx % 2 === 1
                      ? 'bg-[#F9FAFB] hover:bg-[#EFF6FF]'
                      : 'bg-white hover:bg-[#EFF6FF]'
                  }`}
                >
                  {/* Column 1: Index with subtle drag handle */}
                  <td className="px-1 text-center font-mono text-[11px] text-[#64748B] border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="opacity-0 group-hover:opacity-70 cursor-grab text-[#94A3B8]">
                        <GripVertical className="w-2.5 h-2.5" />
                      </span>
                      <span>{idx + 1}</span>
                    </div>
                  </td>

                  {/* Column 2: Task Name with Indentation & GanttProject Icon */}
                  <td className="px-2 border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden">
                    <div
                      className="flex items-center gap-1.5 h-full"
                      style={{ paddingRight: `${task.level * 16}px` }}
                    >
                      {/* Collapse/Expand for Summary tasks */}
                      {hasChildren ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollapseTask(task.id);
                          }}
                          className="p-0.5 text-[#334155] hover:text-black transition-colors"
                          title={isCollapsed ? 'توسيع' : 'طي'}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
                          )}
                        </button>
                      ) : (
                        <div className="w-3.5" />
                      )}

                      {/* GanttProject Task Icon */}
                      {task.milestone ? (
                        <Diamond className="w-3.5 h-3.5 text-black shrink-0 fill-black" />
                      ) : task.summary ? (
                        isCollapsed ? (
                          <Folder className="w-3.5 h-3.5 text-[#334155] shrink-0 fill-[#CBD5E1]" />
                        ) : (
                          <FolderOpen className="w-3.5 h-3.5 text-[#334155] shrink-0 fill-[#CBD5E1]" />
                        )
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-[1px] bg-[#3B82F6] border border-[#1D4ED8] shrink-0" />
                      )}

                      {/* Educational glowing beacon if targeted */}
                      {isTargeted && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      )}

                      {/* Editable Task Name */}
                      {isEditingName ? (
                        <input
                          type="text"
                          defaultValue={task.name}
                          autoFocus
                          onBlur={(e) => {
                            updateTask(task.id, { name: e.target.value.trim() || task.name });
                            setEditingField(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateTask(task.id, { name: (e.target as HTMLInputElement).value.trim() || task.name });
                              setEditingField(null);
                            } else if (e.key === 'Escape') {
                              setEditingField(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-white text-black border border-[#2563EB] rounded px-1 text-[11px] h-5 w-full focus:outline-none"
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingField({ taskId: task.id, field: 'name' });
                          }}
                          className={`truncate text-[12px] ${
                            task.summary
                              ? 'font-bold text-[#0F172A]'
                              : task.milestone
                              ? 'font-bold text-black'
                              : 'text-[#1E293B]'
                          }`}
                          title={task.name}
                        >
                          {task.name}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: Start Date */}
                  <td className="px-1 text-center font-mono text-[11px] text-[#334155] border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden tabular-nums">
                    {task.startDate}
                  </td>

                  {/* Column 4: End Date */}
                  <td className="px-1 text-center font-mono text-[11px] text-[#059669] font-medium border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden tabular-nums">
                    {task.endDate}
                  </td>

                  {/* Column 5: Duration */}
                  <td className="px-1 text-center font-mono text-[11px] border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden tabular-nums">
                    {task.milestone ? (
                      <span className="font-bold text-black">0</span>
                    ) : task.summary ? (
                      <span className="font-bold text-[#0F172A]">{task.duration}</span>
                    ) : (
                      <span>{task.duration}</span>
                    )}
                  </td>

                  {/* Column 6: Predecessors */}
                  <td className="px-1 text-center font-mono text-[10px] text-[#475569] border-l border-[#E2E8F0] whitespace-nowrap overflow-hidden">
                    {getPredecessorsString(task.id)}
                  </td>

                  {/* Column 7: Resources */}
                  <td className="px-2 text-[11px] text-[#334155] border-l border-[#E2E8F0] truncate whitespace-nowrap overflow-hidden" title={getResourceNames(task.id)}>
                    {getResourceNames(task.id)}
                  </td>

                  {/* Column 8: Progress */}
                  <td className="px-1 text-center border-l-0 whitespace-nowrap overflow-hidden">
                    <div className="flex items-center justify-center gap-1 font-mono text-[10px] tabular-nums">
                      <div className="w-10 h-2 bg-[#E2E8F0] rounded-xs overflow-hidden border border-[#CBD5E1]">
                        <div
                          className="h-full bg-[#2563EB]"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[#64748B] w-6 text-left">{task.progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visibleTasks.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-[#64748B] bg-[#FAFAFA]">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <Folder className="w-8 h-8 text-[#94A3B8]" />
                    <p className="font-medium text-sm text-[#334155]">لا توجد مهام مطابقة في العرض الحالي</p>
                    <button
                      onClick={() => addTask(null)}
                      className="mt-2 px-3.5 py-1.5 bg-[#2563EB] text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة مهمة جديدة</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Desktop Right-Click Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-[#F8FAFC] border border-[#CBD5E1] rounded shadow-xl py-1 w-52 text-[11px] text-[#1E293B] select-none"
        >
          <button
            onClick={() => {
              onOpenTaskProps();
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer font-bold text-[#0F172A]"
          >
            <Sliders className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>خصائص المهمة (Task Properties)...</span>
          </button>

          <div className="h-[1px] bg-[#E2E8F0] my-1" />

          <button
            onClick={() => {
              addTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#059669]" />
            <span>مهمة جديدة بعد هذا الصف</span>
          </button>

          <button
            onClick={() => {
              indentTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <Indent className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>تقديم المسافة البادئة (Indent)</span>
          </button>

          <button
            onClick={() => {
              unindentTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <Outdent className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>تأخير المسافة البادئة (Outdent)</span>
          </button>

          <div className="h-[1px] bg-[#E2E8F0] my-1" />

          <button
            onClick={() => {
              moveTaskUp(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>تحريك لأعلى</span>
          </button>

          <button
            onClick={() => {
              moveTaskDown(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>تحريك لأسفل</span>
          </button>

          <button
            onClick={() => {
              toggleMilestone(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-[#E2E8F0] flex items-center gap-2 cursor-pointer"
          >
            <Diamond className="w-3.5 h-3.5" />
            <span>تبديل كمعلم رئيسي (Milestone)</span>
          </button>

          <div className="h-[1px] bg-[#E2E8F0] my-1" />

          <button
            onClick={() => {
              deleteTask(contextMenu.taskId);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1.5 text-right hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف المهمة</span>
          </button>
        </div>
      )}
    </div>
  );
};
