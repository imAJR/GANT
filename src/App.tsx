/**
 * GANT — Interactive Project Planning Simulator (جانت)
 * GanttProject Desktop Simulator & Educational Progression System
 * Designed by: Ali bin Hamed Al-Jabarti (2026)
 * Digital Technology 3 — Unit 1: Project Planning
 */

import React, { useState, useRef, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { NameInputScreen } from './components/screens/NameInputScreen';
import { StageSelectorScreen } from './components/screens/StageSelectorScreen';
import { TopMenu } from './components/layout/TopMenu';
import { Toolbar } from './components/layout/Toolbar';
import { TaskTable } from './components/table/TaskTable';
import { GanttChart } from './components/gantt/GanttChart';
import { ResourcesView } from './components/views/ResourcesView';
import { TaskPropertiesModal } from './components/modals/TaskPropertiesModal';
import { ProjectPropertiesModal } from './components/modals/ProjectPropertiesModal';
import { ResourcesModal } from './components/modals/ResourcesModal';
import { AboutModal } from './components/modals/AboutModal';
import { BeeAssistantPanel } from './components/assistant/BeeAssistantPanel';
import { StageAssistantWidget } from './components/assistant/StageAssistantWidget';
import { InteractiveOnboardingTour } from './components/assistant/InteractiveOnboardingTour';
import { StepDetailModal } from './components/assistant/StepDetailModal';
import { BarChart3, Users, Calendar, Layers, Sparkles, User } from 'lucide-react';

function GanttAppContent() {
  const {
    state,
    computedTasks,
    viewSettings,
    setViewSettings,
    profile,
    setActiveWorkspaceTab,
    setAppScreen,
    notification,
    activeHighlightTargetId,
  } = useProject();

  // Modals state
  const [isTaskPropsOpen, setIsTaskPropsOpen] = useState(false);
  const [isProjectPropsOpen, setIsProjectPropsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isStepDetailOpen, setIsStepDetailOpen] = useState(false);

  // Synchronized scrolling between TaskTable and GanttChart
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    if (!tableScrollRef.current || !chartScrollRef.current) return;
    isSyncingScroll.current = true;
    chartScrollRef.current.scrollTop = tableScrollRef.current.scrollTop;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleChartScroll = () => {
    if (isSyncingScroll.current) return;
    if (!tableScrollRef.current || !chartScrollRef.current) return;
    isSyncingScroll.current = true;
    tableScrollRef.current.scrollTop = chartScrollRef.current.scrollTop;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // Splitter dragging
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const isRtl = (viewSettings.language || 'ar') === 'ar';
      const tableWidth = isRtl ? rect.right - e.clientX : e.clientX - rect.left;
      const percentage = (tableWidth / rect.width) * 100;
      const clamped = Math.min(75, Math.max(25, percentage));

      setViewSettings((prev) => ({
        ...prev,
        tableWidthPercent: clamped,
      }));
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplitter, setViewSettings, viewSettings.language]);

  // Auto-launch guided onboarding tour on first entry to Stage 1 if student hasn't completed any steps yet
  useEffect(() => {
    if (profile.currentStage === 1 && profile.appScreen === 'workspace') {
      const hasSeenTour = sessionStorage.getItem('gant_has_seen_tour_v1');
      if (!hasSeenTour && profile.completedTutorialSteps.length === 0) {
        setIsTourOpen(true);
        sessionStorage.setItem('gant_has_seen_tour_v1', 'true');
      }
    }
  }, [profile.currentStage, profile.appScreen, profile.completedTutorialSteps.length]);

  // 1. Initial Screen: Welcome Screen
  if (profile.appScreen === 'welcome') {
    return <WelcomeScreen />;
  }

  // 2. Student Name Prompt Screen
  if (profile.appScreen === 'name_input') {
    return <NameInputScreen />;
  }

  // 3. Stage Selector Screen
  if (profile.appScreen === 'stage_select') {
    return <StageSelectorScreen />;
  }

  // 4. Main Desktop Workspace (GanttProject Simulator)
  const projectStart = state.project.startDate;
  let projectEnd = projectStart;
  computedTasks.forEach((t) => {
    if (t.endDate > projectEnd) projectEnd = t.endDate;
  });

  const selectedTask = computedTasks.find((t) => t.id === viewSettings.selectedTaskId);
  const activeTab = profile.activeWorkspaceTab;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#E4E7EB] text-[#1E293B] overflow-hidden font-sans select-none">
      {/* 1. Menu Bar */}
      <TopMenu
        onOpenProjectProps={() => setIsProjectPropsOpen(true)}
        onOpenTaskProps={() => setIsTaskPropsOpen(true)}
        onOpenResources={() => setIsResourcesOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* 2. Toolbar */}
      <Toolbar
        onOpenProjectProps={() => setIsProjectPropsOpen(true)}
        onOpenTaskProps={() => setIsTaskPropsOpen(true)}
        onOpenResources={() => setIsResourcesOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* 3. GanttProject Iconic Left Tabs Strip */}
      <div className="bg-[#DFE3E8] border-b border-[#CBD5E1] px-2 flex items-center justify-between text-xs h-7">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveWorkspaceTab('gantt')}
            className={`px-3 py-1 font-semibold rounded-t border-t border-x transition-colors flex items-center gap-1.5 cursor-pointer text-xs ${
              activeTab === 'gantt'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#E2E6EA]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>مخطط جانت والمهام (Gantt)</span>
          </button>

          <button
            id="tab-resources"
            onClick={() => setActiveWorkspaceTab('resources')}
            className={`px-3 py-1 font-semibold rounded-t border-t border-x transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
              activeHighlightTargetId === 'tab-resources'
                ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-500 animate-pulse font-bold'
                : activeTab === 'resources'
                ? 'bg-white border-[#CBD5E1] text-[#0F172A] shadow-xs'
                : 'bg-[#D2D7DE] border-transparent text-[#475569] hover:bg-[#E2E6EA]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>الموارد وفريق العمل (Resources)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#475569] px-2">
          <span>المشروع: <strong className="text-[#0F172A]">مشروع المسرحية المدرسية</strong></span>
          <span>·</span>
          <span>
            {profile.currentStage === 1
              ? 'المرحلة 1: التعلم الموجّه'
              : profile.currentStage === 2
              ? 'المرحلة 2: التحدي المستقل'
              : 'المرحلة 3: الإدارة الحرة'}
          </span>
        </div>
      </div>

      {/* 4. Main Workspace Viewport */}
      <div ref={workspaceRef} className="flex-1 flex overflow-hidden relative bg-white">
        {activeTab === 'gantt' ? (
          <>
            {/* Task Table Viewport */}
            <div
              style={{ width: `${viewSettings.tableWidthPercent}%` }}
              className="h-full shrink-0 overflow-hidden bg-white"
            >
              <TaskTable
                onOpenTaskProps={() => setIsTaskPropsOpen(true)}
                scrollRef={tableScrollRef}
                onScroll={handleTableScroll}
              />
            </div>

            {/* Draggable Divider Splitter */}
            <div
              onMouseDown={handleSplitterMouseDown}
              className={`w-1.5 h-full bg-[#CBD5E1] hover:bg-blue-500 cursor-col-resize transition-colors z-20 shrink-0 ${
                isDraggingSplitter ? 'bg-blue-600' : ''
              }`}
              title="اسحب لتغيير حجم جدول المهام ومخطط جانت"
            />

            {/* Gantt Timeline Viewport */}
            <div
              style={{ width: `${100 - viewSettings.tableWidthPercent}%` }}
              className="h-full flex-1 overflow-hidden bg-white"
            >
              <GanttChart
                onOpenTaskProps={() => setIsTaskPropsOpen(true)}
                scrollRef={chartScrollRef}
                onScroll={handleChartScroll}
              />
            </div>
          </>
        ) : (
          <ResourcesView />
        )}
      </div>

      {/* 5. Desktop Status Bar */}
      <footer className="h-6 bg-[#E2E6EA] border-t border-[#CBD5E1] px-3 flex items-center justify-between text-[11px] text-[#475569] select-none z-20">
        <div className="flex items-center gap-3">
          <span className="text-[#2563EB] font-bold">GANT (جانت)</span>
          <span className="text-neutral-400">|</span>
          <span>إجمالي المهام: <strong className="text-[#0F172A] font-mono">{computedTasks.length}</strong></span>
          <span className="text-neutral-400">|</span>
          <span>تاريخ البدء: <strong className="text-[#0F172A] font-mono">{projectStart}</strong></span>
          <span className="text-neutral-400">|</span>
          <span>تاريخ النهاية: <strong className="text-[#059669] font-mono">{projectEnd}</strong></span>
          {selectedTask && (
            <>
              <span className="text-neutral-400 hidden md:inline">|</span>
              <span className="hidden md:inline">
                المهمة المحددة: <strong className="text-[#0F172A]">{selectedTask.name}</strong> ({selectedTask.duration} يوم)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-[#64748B]">
          <span>الطالب: <strong className="text-[#0F172A]">{profile.studentName || 'غير مسجل'}</strong></span>
          <span>·</span>
          <span>علي بن حامد الجبرتي (2026)</span>
        </div>
      </footer>

      {/* 6. Live Pedagogical Assistant Dock */}
      <StageAssistantWidget
        onOpenTour={() => setIsTourOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenProjectProps={() => setIsProjectPropsOpen(true)}
        onOpenTaskProps={() => setIsTaskPropsOpen(true)}
      />

      {/* 7. Notification Toast */}
      {notification && (
        <div className="fixed bottom-9 right-6 z-50 bg-[#0F172A] border border-blue-500/50 text-white text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Modals */}
      <TaskPropertiesModal
        isOpen={isTaskPropsOpen}
        onClose={() => setIsTaskPropsOpen(false)}
      />

      <ProjectPropertiesModal
        isOpen={isProjectPropsOpen}
        onClose={() => setIsProjectPropsOpen(false)}
      />

      <ResourcesModal
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <BeeAssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onOpenTaskProps={() => setIsTaskPropsOpen(true)}
        onOpenProjectProps={() => setIsProjectPropsOpen(true)}
        onOpenResources={() => {
          setActiveWorkspaceTab('resources');
          setIsResourcesOpen(true);
        }}
        onOpenStepModal={() => setIsStepDetailOpen(true)}
      />

      <StepDetailModal
        isOpen={isStepDetailOpen}
        onClose={() => setIsStepDetailOpen(false)}
        stepIndex={profile.tutorialStepIndex}
      />

      <InteractiveOnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onOpenProjectProps={() => setIsProjectPropsOpen(true)}
        onOpenTaskProps={() => setIsTaskPropsOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <GanttAppContent />
    </ProjectProvider>
  );
}
