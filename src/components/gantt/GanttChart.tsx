/**
 * GANT — Authentic GanttProject Desktop Gantt Chart Timeline
 * Pixel-perfect row alignment (28px), synchronized scrolling,
 * smooth drag-and-drop, interactive dependency links, and classic desktop styling.
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 */

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import {
  Diamond,
  Link,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ComputedTask } from '../../types/project';
import {
  diffCalendarDays,
  parseLocalDate,
  toDateString,
  addCalendarDays,
  isWeekendDay,
  WEEKDAY_NAMES_AR,
  MONTH_NAMES_AR,
} from '../../utils/calendar';
import { ROW_HEIGHT, HEADER_HEIGHT } from '../table/TaskTable';

interface GanttChartProps {
  onOpenTaskProps: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  onOpenTaskProps,
  scrollRef,
  onScroll,
}) => {
  const {
    state,
    computedTasks,
    viewSettings,
    selectTask,
    updateTask,
    addDependency,
    removeDependency,
    activeTargetTaskId,
  } = useProject();

  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    task: ComputedTask;
    x: number;
    y: number;
  } | null>(null);

  // Smooth drag preview state (avoids flooding undo stack during mouse movement)
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize';
    taskId: string;
    initialMouseX: number;
    initialStartDate: string;
    initialDuration: number;
    previewStartDate: string;
    previewDuration: number;
  } | null>(null);

  // Interactive dependency linking state
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);

  const selectedTaskId = viewSettings.selectedTaskId;
  const collapsedIds = viewSettings.collapsedTaskIds;
  const weekendDays = state.project.weekendDays;

  // Filter tasks matching TaskTable visibility
  const visibleTasks = useMemo(() => {
    return computedTasks.filter((task) => {
      let currParentId = task.parentId;
      while (currParentId) {
        if (collapsedIds.includes(currParentId)) return false;
        const parentTask = computedTasks.find((t) => t.id === currParentId);
        currParentId = parentTask?.parentId || null;
      }
      return true;
    });
  }, [computedTasks, collapsedIds]);

  // Column width by zoom level
  const dayColumnWidth = useMemo(() => {
    switch (viewSettings.zoomLevel) {
      case 'month':
        return 16;
      case 'week':
        return 26;
      case 'day':
      default:
        return 36;
    }
  }, [viewSettings.zoomLevel]);

  // Determine timeline boundary dates
  const { timelineStartDate, totalDays, dayList } = useMemo(() => {
    if (visibleTasks.length === 0) {
      const start = state.project.startDate || '2026-10-11';
      return {
        timelineStartDate: start,
        totalDays: 60,
        dayList: Array.from({ length: 60 }).map((_, i) => addCalendarDays(start, i)),
      };
    }

    let earliest = visibleTasks[0].startDate;
    let latest = visibleTasks[0].endDate;

    visibleTasks.forEach((t) => {
      if (t.startDate < earliest) earliest = t.startDate;
      if (t.endDate > latest) latest = t.endDate;
    });

    // Add buffer days before and after
    const timelineStart = addCalendarDays(earliest, -5);
    const timelineEnd = addCalendarDays(latest, 20);
    const spanDays = Math.max(35, diffCalendarDays(timelineStart, timelineEnd));

    const days: string[] = [];
    for (let i = 0; i <= spanDays; i++) {
      days.push(addCalendarDays(timelineStart, i));
    }

    return {
      timelineStartDate: timelineStart,
      totalDays: days.length,
      dayList: days,
    };
  }, [visibleTasks, state.project.startDate]);

  // Chart dimensions
  const chartWidth = totalDays * dayColumnWidth;
  const chartHeight = visibleTasks.length * ROW_HEIGHT;

  // Helper: Date string -> X coordinate
  const dateToX = useCallback(
    (dateStr: string) => {
      const days = diffCalendarDays(timelineStartDate, dateStr);
      return days * dayColumnWidth;
    },
    [timelineStartDate, dayColumnWidth]
  );

  // Today marker X coordinate
  const todayStr = toDateString(new Date());
  const todayX = dateToX(todayStr);

  // Map task ID to row index
  const taskRowIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    visibleTasks.forEach((t, i) => map.set(t.id, i));
    return map;
  }, [visibleTasks]);

  // Smooth drag event listeners
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.initialMouseX;
      const daysDelta = Math.round(deltaX / dayColumnWidth);

      if (dragState.type === 'move') {
        const newStart = addCalendarDays(dragState.initialStartDate, daysDelta);
        setDragState((prev) => (prev ? { ...prev, previewStartDate: newStart } : null));
      } else if (dragState.type === 'resize') {
        const newDuration = Math.max(1, dragState.initialDuration + daysDelta);
        setDragState((prev) => (prev ? { ...prev, previewDuration: newDuration } : null));
      }
    };

    const handleMouseUp = () => {
      if (dragState.type === 'move') {
        if (dragState.previewStartDate !== dragState.initialStartDate) {
          updateTask(dragState.taskId, { startDate: dragState.previewStartDate });
        }
      } else if (dragState.type === 'resize') {
        if (dragState.previewDuration !== dragState.initialDuration) {
          updateTask(dragState.taskId, { duration: dragState.previewDuration });
        }
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayColumnWidth, updateTask]);

  // Month header groupings
  const monthGroups = useMemo(() => {
    const groups: { label: string; startIndex: number; count: number }[] = [];
    if (dayList.length === 0) return groups;

    let currentMonth = '';
    let startIndex = 0;
    let count = 0;

    dayList.forEach((dateStr, idx) => {
      const d = parseLocalDate(dateStr);
      const mLabel = `${MONTH_NAMES_AR[d.getMonth()]} ${d.getFullYear()}`;
      if (mLabel !== currentMonth) {
        if (count > 0) {
          groups.push({ label: currentMonth, startIndex, count });
        }
        currentMonth = mLabel;
        startIndex = idx;
        count = 1;
      } else {
        count++;
      }
    });

    if (count > 0) {
      groups.push({ label: currentMonth, startIndex, count });
    }

    return groups;
  }, [dayList]);

  // Dependency arrows generator
  const dependencyLines = useMemo(() => {
    if (!viewSettings.showDependencies) return [];

    return state.dependencies
      .map((dep) => {
        const predRow = taskRowIndexMap.get(dep.predecessorId);
        const succRow = taskRowIndexMap.get(dep.successorId);
        const predTask = computedTasks.find((t) => t.id === dep.predecessorId);
        const succTask = computedTasks.find((t) => t.id === dep.successorId);

        if (predRow === undefined || succRow === undefined || !predTask || !succTask) {
          return null;
        }

        // Predecessor bar coordinates
        const predStartX = dateToX(predTask.startDate);
        const predEndX = predTask.milestone
          ? predStartX + dayColumnWidth / 2 + 7
          : dateToX(predTask.endDate) + dayColumnWidth;
        const predY = predRow * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Successor bar coordinates
        const succStartX = succTask.milestone
          ? dateToX(succTask.startDate) + dayColumnWidth / 2 - 7
          : dateToX(succTask.startDate);
        const succY = succRow * ROW_HEIGHT + ROW_HEIGHT / 2;

        let startX = predEndX;
        let startY = predY;
        let endX = succStartX;
        let endY = succY;

        if (dep.type === 'SS') {
          startX = predStartX;
          endX = succStartX;
        } else if (dep.type === 'FF') {
          startX = predEndX;
          endX = succTask.milestone
            ? dateToX(succTask.endDate) + dayColumnWidth / 2 + 7
            : dateToX(succTask.endDate) + dayColumnWidth;
        }

        const bendOffset = 12;
        let path = '';

        if (endX >= startX + bendOffset) {
          const midX = startX + bendOffset;
          path = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        } else {
          const midY = startY + (endY > startY ? ROW_HEIGHT / 2 : -ROW_HEIGHT / 2);
          path = `M ${startX} ${startY} L ${startX + 8} ${startY} L ${startX + 8} ${midY} L ${endX - 8} ${midY} L ${endX - 8} ${endY} L ${endX} ${endY}`;
        }

        return {
          id: dep.id,
          dep,
          path,
          endX,
          endY,
          isStrong: dep.hardness === 'Strong',
          predName: predTask.name,
          succName: succTask.name,
        };
      })
      .filter(Boolean);
  }, [
    state.dependencies,
    taskRowIndexMap,
    computedTasks,
    dateToX,
    dayColumnWidth,
    viewSettings.showDependencies,
  ]);

  const linkingTask = linkingFromId ? computedTasks.find((t) => t.id === linkingFromId) : null;

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-white overflow-hidden select-none relative text-[12px]"
    >
      {/* Interactive linking notice banner */}
      {linkingFromId && (
        <div className="bg-[#FEF3C7] border-b border-[#F59E0B] text-[#92400E] px-3 py-1 flex items-center justify-between text-xs font-semibold z-30 shadow-xs">
          <div className="flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-[#D97706] animate-pulse" />
            <span>
              ربط المهمة: <strong className="text-black">{linkingTask?.name}</strong> — انقر على المهمة اللاحقة لإنشاء رابط التبعية (FS)
            </span>
          </div>
          <button
            onClick={() => setLinkingFromId(null)}
            className="text-xs bg-white border border-[#D97706] text-[#92400E] hover:bg-[#FDE68A] px-2 py-0.5 rounded cursor-pointer"
          >
            إلغاء الربط
          </button>
        </div>
      )}

      {/* Gantt Scrollable Viewport (Explicit LTR direction for standard timeline time axis) */}
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        onScroll={onScroll}
        dir="ltr"
        className="flex-1 overflow-auto relative bg-white outline-none"
      >
        <div
          style={{ width: `${chartWidth}px`, minHeight: `${HEADER_HEIGHT + chartHeight}px` }}
          className="relative bg-white"
        >
          {/* Header Row 1: Months / Years (Exact 24px) */}
          <div
            style={{ height: '24px' }}
            className="sticky top-0 bg-[#DFE3E8] border-b border-[#CBD5E1] flex z-20 text-[11px] font-bold text-[#1E293B]"
          >
            {monthGroups.map((mg, i) => (
              <div
                key={i}
                style={{
                  width: `${mg.count * dayColumnWidth}px`,
                  left: `${mg.startIndex * dayColumnWidth}px`,
                }}
                className="border-r border-[#CBD5E1] px-2 flex items-center font-bold text-[#1E293B] truncate"
              >
                {mg.label}
              </div>
            ))}
          </div>

          {/* Header Row 2: Days (Exact 24px, total HEADER_HEIGHT = 48px) */}
          <div
            style={{ height: '24px', top: '24px' }}
            className="sticky bg-[#E6E9ED] border-b border-[#CBD5E1] flex z-20 text-[10px]"
          >
            {dayList.map((dateStr) => {
              const d = parseLocalDate(dateStr);
              const dayNum = d.getDate();
              const dayOfWeek = d.getDay();
              const isWeekend = isWeekendDay(d, weekendDays);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  style={{ width: `${dayColumnWidth}px` }}
                  className={`border-r border-[#CBD5E1] flex flex-col items-center justify-center font-mono tabular-nums ${
                    isToday
                      ? 'bg-[#FEF3C7] text-[#92400E] font-bold'
                      : isWeekend && viewSettings.showWeekendHighlight
                      ? 'bg-[#E2E8F0] text-[#64748B]'
                      : 'text-[#334155]'
                  }`}
                  title={`${WEEKDAY_NAMES_AR[dayOfWeek]} ${dayNum} (${dateStr})`}
                >
                  <span className="leading-none text-[10px] font-semibold">{dayNum}</span>
                </div>
              );
            })}
          </div>

          {/* Background Grid Columns & Weekend Lanes */}
          <div
            style={{
              position: 'absolute',
              top: `${HEADER_HEIGHT}px`,
              left: 0,
              width: `${chartWidth}px`,
              height: `${chartHeight}px`,
              pointerEvents: 'none',
            }}
          >
            {dayList.map((dateStr, idx) => {
              const d = parseLocalDate(dateStr);
              const isWeekend = isWeekendDay(d, weekendDays);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={`bg_${dateStr}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${idx * dayColumnWidth}px`,
                    width: `${dayColumnWidth}px`,
                  }}
                  className={`border-r border-[#E2E8F0] ${
                    isToday && viewSettings.showTodayLine
                      ? 'bg-[#FEF3C7]/40'
                      : isWeekend && viewSettings.showWeekendHighlight
                      ? 'bg-[#F1F5F9]'
                      : ''
                  }`}
                />
              );
            })}

            {/* Horizontal Row Dividers: Exact ROW_HEIGHT (28px) */}
            {visibleTasks.map((_, idx) => (
              <div
                key={`h_row_${idx}`}
                style={{
                  position: 'absolute',
                  top: `${idx * ROW_HEIGHT}px`,
                  left: 0,
                  width: `${chartWidth}px`,
                  height: `${ROW_HEIGHT}px`,
                }}
                className="border-b border-[#E2E8F0]"
              />
            ))}
          </div>

          {/* Today Red Line Indicator */}
          {viewSettings.showTodayLine && todayX >= 0 && todayX <= chartWidth && (
            <div
              style={{
                position: 'absolute',
                top: `${HEADER_HEIGHT}px`,
                left: `${todayX + dayColumnWidth / 2}px`,
                height: `${chartHeight}px`,
                width: '2px',
                zIndex: 15,
              }}
              className="bg-red-500 pointer-events-none"
            />
          )}

          {/* SVG Connector Layer for Dependency Arrows */}
          <svg
            style={{
              position: 'absolute',
              top: `${HEADER_HEIGHT}px`,
              left: 0,
              width: `${chartWidth}px`,
              height: `${chartHeight}px`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <defs>
              <marker
                id="gp-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 7 4, 0 7" fill="#1E293B" />
              </marker>
            </defs>

            {dependencyLines.map((line) => {
              if (!line) return null;
              return (
                <g key={line.id} className="group cursor-pointer pointer-events-auto">
                  {/* Invisible thicker stroke for easy clicking */}
                  <path
                    d={line.path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    onClick={() => {
                      if (window.confirm(`هل تريد حذف رابط التبعية بين "${line.predName}" و "${line.succName}"؟`)) {
                        removeDependency(line.id);
                      }
                    }}
                  />
                  {/* Visual crisp stepped arrow */}
                  <path
                    d={line.path}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="1.5"
                    markerEnd="url(#gp-arrowhead)"
                    className="transition-colors hover:stroke-red-600 hover:stroke-[2]"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Task Bars Layer */}
          <div
            style={{
              position: 'absolute',
              top: `${HEADER_HEIGHT}px`,
              left: 0,
              width: `${chartWidth}px`,
              height: `${chartHeight}px`,
              zIndex: 12,
            }}
          >
            {visibleTasks.map((task, rowIdx) => {
              const isSelected = task.id === selectedTaskId;
              const isTargeted = task.id === activeTargetTaskId;
              const isDraggingThis = dragState?.taskId === task.id;

              // Use drag preview dates if actively dragging
              const activeStartDate = isDraggingThis && dragState.type === 'move'
                ? dragState.previewStartDate
                : task.startDate;

              const activeDuration = isDraggingThis && dragState.type === 'resize'
                ? dragState.previewDuration
                : task.duration;

              const startX = dateToX(activeStartDate);
              const computedEndX = isDraggingThis && dragState.type === 'resize'
                ? startX + activeDuration * dayColumnWidth
                : dateToX(task.endDate) + dayColumnWidth;

              const barWidth = Math.max(dayColumnWidth, computedEndX - startX);
              const topY = rowIdx * ROW_HEIGHT;

              const assigned = state.assignments
                .filter((a) => a.taskId === task.id)
                .map((a) => state.resources.find((r) => r.id === a.resourceId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <div
                  key={task.id}
                  style={{
                    position: 'absolute',
                    top: `${topY}px`,
                    height: `${ROW_HEIGHT}px`,
                    left: 0,
                    width: `${chartWidth}px`,
                  }}
                  className={`flex items-center transition-none ${
                    isSelected ? 'bg-[#CCE4F7]/60' : isTargeted ? 'bg-amber-100/40 ring-1 ring-inset ring-amber-400' : ''
                  }`}
                  onClick={() => selectTask(task.id)}
                >
                  {/* 1. MILESTONE: Authentic GanttProject Black Diamond ◆ */}
                  {task.milestone ? (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${startX + dayColumnWidth / 2 - 7}px`,
                        top: `${(ROW_HEIGHT - 14) / 2}px`,
                      }}
                      className="group/bar cursor-pointer flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (linkingFromId) {
                          addDependency(linkingFromId, task.id, 'FS', 'Strong');
                          setLinkingFromId(null);
                        } else {
                          selectTask(task.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        selectTask(task.id);
                        onOpenTaskProps();
                      }}
                      onMouseEnter={() => {
                        setTooltipData({ task, x: startX + 25, y: topY + HEADER_HEIGHT });
                      }}
                      onMouseLeave={() => {
                        setTooltipData(null);
                      }}
                    >
                      <div
                        className={`w-[14px] h-[14px] rotate-45 border transition-none flex items-center justify-center ${
                          isSelected
                            ? 'bg-black border-[#2563EB] ring-2 ring-[#2563EB]'
                            : isTargeted
                            ? 'bg-black border-amber-500 ring-2 ring-amber-400 animate-pulse'
                            : 'bg-black border-neutral-900 hover:scale-110'
                        }`}
                      />
                      <span className="ml-2 font-bold text-[11px] text-[#0F172A] whitespace-nowrap">
                        {task.name}
                      </span>
                    </div>
                  ) : task.summary ? (
                    /* 2. SUMMARY TASK: Authentic GanttProject Solid Black Bracket Bar */
                    <div
                      style={{
                        position: 'absolute',
                        left: `${startX}px`,
                        width: `${barWidth}px`,
                        top: `${(ROW_HEIGHT - 16) / 2}px`,
                        height: '16px',
                      }}
                      className="group/bar cursor-pointer select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (linkingFromId) {
                          addDependency(linkingFromId, task.id, 'FS', 'Normal');
                          setLinkingFromId(null);
                        } else {
                          selectTask(task.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        selectTask(task.id);
                        onOpenTaskProps();
                      }}
                      onMouseEnter={() => {
                        setTooltipData({ task, x: startX + barWidth + 10, y: topY + HEADER_HEIGHT });
                      }}
                      onMouseLeave={() => {
                        setTooltipData(null);
                      }}
                    >
                      {/* Top Horizontal Black Line */}
                      <div className="w-full h-[6px] bg-[#0F172A] relative">
                        {/* Left Tooth Bracket */}
                        <div className="absolute top-[6px] left-0 w-0 h-0 border-r-[5px] border-r-transparent border-t-[6px] border-t-[#0F172A]" />
                        {/* Right Tooth Bracket */}
                        <div className="absolute top-[6px] right-0 w-0 h-0 border-l-[5px] border-l-transparent border-t-[6px] border-t-[#0F172A]" />
                      </div>

                      {/* Summary Task Label */}
                      <div className="absolute left-full ml-2 top-0 flex items-center gap-1 whitespace-nowrap">
                        <span className="font-bold text-[11px] text-[#0F172A]">
                          {task.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 3. NORMAL TASK BAR: GanttProject Blue Bar with Darker Progress Fill */
                    <div
                      style={{
                        position: 'absolute',
                        left: `${startX}px`,
                        width: `${barWidth}px`,
                        top: `${(ROW_HEIGHT - 18) / 2}px`,
                        height: '18px',
                      }}
                      className={`group/bar rounded-[2px] cursor-grab active:cursor-grabbing border transition-none flex items-center relative overflow-visible ${
                        isSelected
                          ? 'bg-[#3B82F6] border-[#1D4ED8] ring-2 ring-[#2563EB]'
                          : isTargeted
                          ? 'bg-[#3B82F6] border-amber-500 ring-2 ring-amber-400 shadow-sm animate-pulse'
                          : 'bg-[#60A5FA] hover:bg-[#3B82F6] border-[#2563EB]'
                      }`}
                      onMouseDown={(e) => {
                        if (e.button === 0) {
                          setDragState({
                            type: 'move',
                            taskId: task.id,
                            initialMouseX: e.clientX,
                            initialStartDate: task.startDate,
                            initialDuration: task.duration,
                            previewStartDate: task.startDate,
                            previewDuration: task.duration,
                          });
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (linkingFromId) {
                          addDependency(linkingFromId, task.id, 'FS', 'Strong');
                          setLinkingFromId(null);
                        } else {
                          selectTask(task.id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        selectTask(task.id);
                        onOpenTaskProps();
                      }}
                      onMouseEnter={() => {
                        setTooltipData({ task, x: startX + barWidth + 10, y: topY + HEADER_HEIGHT });
                      }}
                      onMouseLeave={() => {
                        setTooltipData(null);
                      }}
                    >
                      {/* Dark Inner Progress Fill */}
                      <div
                        className="h-full bg-[#1D4ED8] rounded-r pointer-events-none"
                        style={{ width: `${task.progress}%` }}
                      />

                      {/* Bar Text Label */}
                      <div className="absolute inset-0 px-1.5 flex items-center justify-between text-white text-[10px] font-semibold pointer-events-none truncate">
                        <span className="truncate drop-shadow-xs">{task.name}</span>
                        {task.progress > 0 && barWidth > 60 && (
                          <span className="font-mono tabular-nums opacity-95 text-[9px]">
                            {task.progress}%
                          </span>
                        )}
                      </div>

                      {/* Right-Edge Resize Handle */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2.5 cursor-ew-resize hover:bg-white/40 transition-colors z-20"
                        title="اسحب لتعديل مدة المهمة"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragState({
                            type: 'resize',
                            taskId: task.id,
                            initialMouseX: e.clientX,
                            initialStartDate: task.startDate,
                            initialDuration: task.duration,
                            previewStartDate: task.startDate,
                            previewDuration: task.duration,
                          });
                        }}
                      />

                      {/* Connector Dot to Link Tasks */}
                      <button
                        className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#2563EB] hover:bg-black text-white flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-sm z-30 cursor-pointer"
                        title="انقر لربط هذه المهمة بمهمة أخرى (FS)"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinkingFromId(linkingFromId === task.id ? null : task.id);
                        }}
                      >
                        <Link className="w-2 h-2" />
                      </button>

                      {/* External Label for Task Name or Resource */}
                      <div className="absolute left-full ml-2 flex items-center gap-1.5 text-[10px] text-[#475569] font-medium whitespace-nowrap pointer-events-none">
                        <span>{task.name}</span>
                        {assigned && <span className="text-[#2563EB]">[{assigned}]</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {tooltipData && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(window.innerWidth - 260, tooltipData.x)}px`,
            top: `${tooltipData.y + 10}px`,
          }}
          className="z-50 bg-[#1E293B] border border-[#475569] rounded p-2 shadow-2xl text-[11px] text-white pointer-events-none w-56"
        >
          <div className="flex items-center justify-between border-b border-[#475569] pb-1 mb-1 font-bold">
            <span className="truncate">{tooltipData.task.name}</span>
            <span className="text-[10px] font-mono text-[#93C5FD]">
              {tooltipData.task.milestone
                ? 'معلم رئيسي'
                : tooltipData.task.summary
                ? 'مهمة تلخيصية'
                : `${tooltipData.task.duration} أيام`}
            </span>
          </div>

          <div className="space-y-0.5 text-[10px] text-[#CBD5E1]">
            <div className="flex justify-between">
              <span>تاريخ البدء:</span>
              <span className="font-mono text-white tabular-nums">{tooltipData.task.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span>تاريخ الانتهاء:</span>
              <span className="font-mono text-[#6EE7B7] tabular-nums">{tooltipData.task.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span>نسبة الإنجاز:</span>
              <span className="font-mono text-[#93C5FD] tabular-nums">{tooltipData.task.progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
