/**
 * GANT — Project Context & State Management
 * Full support for Undo/Redo, Local Persistence, Computed Schedules,
 * and Project Operations.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ProjectState,
  ProjectMetadata,
  Task,
  ComputedTask,
  Resource,
  Role,
  Assignment,
  Dependency,
  ViewSettings,
  StudentProfile,
  AppScreen,
  WorkspaceTab,
} from '../types/project';
import { createInitialProjectState, createTutorialStartState } from '../data/initialProject';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { computeProjectSchedule, autoScheduleTasks, wouldCreateCycle } from '../utils/scheduler';
import { toDateString } from '../utils/calendar';
import { sanitizeAndValidateProjectJSON } from '../utils/projectValidator';

const STORAGE_KEY = 'GANT_PROJECT_STATE_2026';
const PROFILE_KEY = 'GANT_STUDENT_PROFILE_2026';

const DEFAULT_PROFILE: StudentProfile = {
  studentName: '',
  currentStage: 1,
  unlockedStages: [1],
  tutorialStepIndex: 0,
  completedTutorialSteps: [],
  stage2Completed: false,
  stage3Completed: false,
  appScreen: 'welcome',
  activeWorkspaceTab: 'gantt',
};

interface ProjectContextValue {
  // State
  state: ProjectState;
  computedTasks: ComputedTask[];
  viewSettings: ViewSettings;

  // Student Profile & Stages
  profile: StudentProfile;
  activeHighlightTargetId: string | null;
  activeTargetTaskId: string | null;
  setStudentName: (name: string) => void;
  setAppScreen: (screen: AppScreen) => void;
  selectStage: (stage: 1 | 2 | 3) => void;
  setActiveWorkspaceTab: (tab: WorkspaceTab) => void;
  advanceTutorialStep: () => void;
  previousTutorialStep: () => void;
  setTutorialStep: (index: number) => void;
  completeCurrentTutorialStep: () => void;
  completeStage2: () => void;
  resetStudentProgress: () => void;

  // History & Persistence
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveProject: () => void;
  resetToEducationalScenario: () => void;
  exportProjectJSON: () => void;
  importProjectJSON: (jsonStr: string) => boolean;

  // View Settings
  setViewSettings: React.Dispatch<React.SetStateAction<ViewSettings>>;
  selectTask: (taskId: string | null) => void;
  selectNextTask: () => void;
  selectPrevTask: () => void;
  toggleCollapseTask: (taskId: string) => void;

  // Task Operations
  addTask: (afterTaskId?: string | null) => string;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  indentTask: (taskId: string) => void;
  unindentTask: (taskId: string) => void;
  moveTaskUp: (taskId: string) => void;
  moveTaskDown: (taskId: string) => void;
  toggleMilestone: (taskId: string) => void;
  reorderTasks: (sourceIndex: number, destinationIndex: number) => void;
  setTaskParent: (taskId: string, parentId: string | null) => void;

  // Dependencies
  addDependency: (predecessorId: string, successorId: string, type?: Dependency['type'], hardness?: Dependency['hardness'], delay?: number) => boolean;
  removeDependency: (dependencyId: string) => void;
  updateDependency: (dependencyId: string, updates: Partial<Dependency>) => void;
  autoSchedule: () => void;

  // Resources & Roles
  addResource: (name: string, roleId: string) => string;
  updateResource: (resourceId: string, updates: Partial<Resource>) => void;
  deleteResource: (resourceId: string) => void;

  addRole: (name: string) => string;
  updateRole: (roleId: string, name: string) => void;
  deleteRole: (roleId: string) => void;

  // Assignments
  assignResourceToTask: (taskId: string, resourceId: string, unit?: number) => void;
  unassignResourceFromTask: (taskId: string, resourceId: string) => void;
  updateAssignmentUnit: (assignmentId: string, unit: number) => void;

  // Project Settings
  updateProjectMetadata: (updates: Partial<ProjectMetadata>) => void;

  // Notifications
  notification: string | null;
  showNotification: (msg: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentStage === 'number') {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // storage quota or error
    }
  }, [profile]);

  // Load initial state from LocalStorage or fall back
  const [state, setState] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = sanitizeAndValidateProjectJSON(parsed);
        if (validated.isValid && validated.sanitizedState) {
          return validated.sanitizedState;
        }
      }
    } catch {
      // Fallback
    }
    return createInitialProjectState();
  });

  // History Stacks
  const [historyPast, setHistoryPast] = useState<ProjectState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<ProjectState[]>([]);

  // Notification Toast
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  // View Settings
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showEnglishTerms: false,
    language: 'ar',
    showTodayLine: true,
    showDependencies: true,
    showWeekendHighlight: true,
    zoomLevel: 'day',
    tableWidthPercent: 44, // 44% table, 56% gantt chart
    selectedTaskId: 'task_cast',
    collapsedTaskIds: [],
  });

  // Synchronize document direction and language attribute dynamically
  useEffect(() => {
    const lang = viewSettings.language || 'ar';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }, [viewSettings.language]);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or error
    }
  }, [state]);

  // Push new state with Undo snapshot
  const commitChange = useCallback((updater: (prev: ProjectState) => ProjectState) => {
    setState((prevState) => {
      const nextState = updater(prevState);
      setHistoryPast((past) => [...past.slice(-30), JSON.parse(JSON.stringify(prevState))]);
      setHistoryFuture([]);
      return nextState;
    });
  }, []);

  // Undo
  const undo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    const newPast = historyPast.slice(0, -1);

    setHistoryFuture((future) => [JSON.parse(JSON.stringify(state)), ...future]);
    setHistoryPast(newPast);
    setState(previous);
    showNotification('تم التراجع عن الإجراء السابق');
  }, [historyPast, state, showNotification]);

  // Redo
  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    const newFuture = historyFuture.slice(1);

    setHistoryPast((past) => [...past, JSON.parse(JSON.stringify(state))]);
    setHistoryFuture(newFuture);
    setState(next);
    showNotification('تمت إعادة الإجراء');
  }, [historyFuture, state, showNotification]);

  // Computed Tasks
  const computedTasks = useMemo(() => {
    return computeProjectSchedule(state.tasks, state.dependencies, state.project);
  }, [state.tasks, state.dependencies, state.project]);

  // Save explicitly
  const saveProject = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showNotification('تم حفظ المشروع بنجاح في التخزين المحلي');
  }, [state, showNotification]);

  // Reset to educational scenario
  const resetToEducationalScenario = useCallback(() => {
    const pristine = createInitialProjectState();
    commitChange(() => pristine);
    showNotification('تمت استعادة مشروع المسرحية المدرسية الأصلي');
  }, [commitChange, showNotification]);

  // Export JSON
  const exportProjectJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${state.project.name || 'GANT_Project'}_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('تم تصدير ملف المشروع');
  }, [state, showNotification]);

  // Import JSON
  const importProjectJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const validated = sanitizeAndValidateProjectJSON(parsed);
      if (validated.isValid && validated.sanitizedState) {
        commitChange(() => validated.sanitizedState!);
        showNotification('تم استيراد بيانات المشروع بنجاح والتحقق من سلامتها');
        return true;
      }
    } catch {
      // Invalid JSON
    }
    showNotification('خطأ: ملف المشروع غير صالح أو يحتوي على بنية غير مدعومة');
    return false;
  }, [commitChange, showNotification]);

  // Select Task
  const selectTask = useCallback((taskId: string | null) => {
    setViewSettings((prev) => ({ ...prev, selectedTaskId: taskId }));
  }, []);

  const selectNextTask = useCallback(() => {
    setViewSettings((prev) => {
      if (computedTasks.length === 0) return prev;
      if (!prev.selectedTaskId) {
        return { ...prev, selectedTaskId: computedTasks[0].id };
      }
      const idx = computedTasks.findIndex((t) => t.id === prev.selectedTaskId);
      if (idx === -1 || idx >= computedTasks.length - 1) return prev;
      return { ...prev, selectedTaskId: computedTasks[idx + 1].id };
    });
  }, [computedTasks]);

  const selectPrevTask = useCallback(() => {
    setViewSettings((prev) => {
      if (computedTasks.length === 0) return prev;
      if (!prev.selectedTaskId) {
        return { ...prev, selectedTaskId: computedTasks[0].id };
      }
      const idx = computedTasks.findIndex((t) => t.id === prev.selectedTaskId);
      if (idx <= 0) return prev;
      return { ...prev, selectedTaskId: computedTasks[idx - 1].id };
    });
  }, [computedTasks]);

  // Collapse / Expand Task
  const toggleCollapseTask = useCallback((taskId: string) => {
    setViewSettings((prev) => {
      const isCollapsed = prev.collapsedTaskIds.includes(taskId);
      return {
        ...prev,
        collapsedTaskIds: isCollapsed
          ? prev.collapsedTaskIds.filter((id) => id !== taskId)
          : [...prev.collapsedTaskIds, taskId],
      };
    });
  }, []);

  // Task Operations
  const addTask = useCallback((afterTaskId?: string | null): string => {
    const newId = `task_${Date.now()}`;
    commitChange((prev) => {
      let targetIndex = prev.tasks.length;
      let parentId: string | null = null;
      let startDate = prev.project.startDate;

      if (afterTaskId) {
        const idx = prev.tasks.findIndex((t) => t.id === afterTaskId);
        if (idx !== -1) {
          targetIndex = idx + 1;
          parentId = prev.tasks[idx].parentId;
          startDate = prev.tasks[idx].startDate;
        }
      }

      const newTask: Task = {
        id: newId,
        name: 'مهمة جديدة',
        parentId,
        startDate,
        duration: 3,
        priority: 'Normal',
        progress: 0,
        milestone: false,
        summary: false,
      };

      const nextTasks = [...prev.tasks];
      nextTasks.splice(targetIndex, 0, newTask);
      return { ...prev, tasks: nextTasks };
    });

    selectTask(newId);
    showNotification('تمت إضافة مهمة جديدة');
    return newId;
  }, [commitChange, selectTask, showNotification]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    commitChange((prev) => {
      const updatedTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
      // Auto-propagate dependencies when date or duration or milestone changes
      if (updates.startDate !== undefined || updates.duration !== undefined || updates.milestone !== undefined) {
        const rescheduled = autoScheduleTasks(updatedTasks, prev.dependencies, prev.project);
        return { ...prev, tasks: rescheduled };
      }
      return { ...prev, tasks: updatedTasks };
    });
    showNotification('تم تحديث بيانات المهمة وتحديث الجدول الزمني بنجاح');
  }, [commitChange, showNotification]);

  const reorderTasks = useCallback((sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    commitChange((prev) => {
      const nextTasks = [...prev.tasks];
      const [moved] = nextTasks.splice(sourceIndex, 1);
      nextTasks.splice(destinationIndex, 0, moved);
      return { ...prev, tasks: nextTasks };
    });
    showNotification('تمت إعادة ترتيب المهام');
  }, [commitChange, showNotification]);

  const setTaskParent = useCallback((taskId: string, parentId: string | null) => {
    if (taskId === parentId) return;
    commitChange((prev) => {
      const nextTasks = prev.tasks.map((t) => (t.id === taskId ? { ...t, parentId } : t));
      return { ...prev, tasks: nextTasks };
    });
    showNotification('تم تحديث التبعية الهرمية للمهمة');
  }, [commitChange, showNotification]);

  const deleteTask = useCallback((taskId: string) => {
    commitChange((prev) => {
      // Find children
      const childrenIds = prev.tasks.filter((t) => t.parentId === taskId).map((t) => t.id);
      const allToRemove = new Set<string>([taskId, ...childrenIds]);

      return {
        ...prev,
        tasks: prev.tasks.filter((t) => !allToRemove.has(t.id)),
        assignments: prev.assignments.filter((a) => !allToRemove.has(a.taskId)),
        dependencies: prev.dependencies.filter(
          (d) => !allToRemove.has(d.predecessorId) && !allToRemove.has(d.successorId)
        ),
      };
    });
    showNotification('تم حذف المهمة');
  }, [commitChange, showNotification]);

  // Indent Task (Make child of preceding task or join sibling group)
  const indentTask = useCallback((taskId: string) => {
    commitChange((prev) => {
      const idx = prev.tasks.findIndex((t) => t.id === taskId);
      if (idx <= 0) return prev; // Cannot indent first task

      const currentTask = prev.tasks[idx];
      const prevTask = prev.tasks[idx - 1];

      // If prevTask has a parent, and currentTask does not share that parent:
      // currentTask joins prevTask's parent group!
      // Otherwise, currentTask indents into prevTask!
      let newParentId: string;
      if (prevTask.parentId && currentTask.parentId !== prevTask.parentId) {
        newParentId = prevTask.parentId;
      } else {
        newParentId = prevTask.id;
      }

      if (currentTask.parentId === newParentId) return prev;

      const nextTasks = prev.tasks.map((t, i) => {
        if (i === idx) {
          return { ...t, parentId: newParentId };
        }
        if (t.id === newParentId) {
          return { ...t, summary: true };
        }
        return t;
      });

      return { ...prev, tasks: nextTasks };
    });
    showNotification('تم تقديم المسافة البادئة (مهمة فرعية)');
  }, [commitChange, showNotification]);

  // Unindent Task (Move up one hierarchy level)
  const unindentTask = useCallback((taskId: string) => {
    commitChange((prev) => {
      const current = prev.tasks.find((t) => t.id === taskId);
      if (!current || !current.parentId) return prev; // Already root

      const oldParentId = current.parentId;
      const parentTask = prev.tasks.find((t) => t.id === oldParentId);
      const newParentId = parentTask ? parentTask.parentId : null;

      const nextTasks = prev.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, parentId: newParentId };
        }
        return t;
      });

      // If old parent no longer has children, remove summary flag
      const remainingChildren = nextTasks.filter((t) => t.parentId === oldParentId);
      if (remainingChildren.length === 0) {
        const parentIdx = nextTasks.findIndex((t) => t.id === oldParentId);
        if (parentIdx !== -1) {
          nextTasks[parentIdx] = { ...nextTasks[parentIdx], summary: false };
        }
      }

      return { ...prev, tasks: nextTasks };
    });
    showNotification('تم تأخير المسافة البادئة (مهمة رئيسية)');
  }, [commitChange, showNotification]);

  // Move Task Up
  const moveTaskUp = useCallback((taskId: string) => {
    commitChange((prev) => {
      const idx = prev.tasks.findIndex((t) => t.id === taskId);
      if (idx <= 0) return prev;
      const nextTasks = [...prev.tasks];
      const temp = nextTasks[idx];
      nextTasks[idx] = nextTasks[idx - 1];
      nextTasks[idx - 1] = temp;
      return { ...prev, tasks: nextTasks };
    });
  }, [commitChange]);

  // Move Task Down
  const moveTaskDown = useCallback((taskId: string) => {
    commitChange((prev) => {
      const idx = prev.tasks.findIndex((t) => t.id === taskId);
      if (idx === -1 || idx >= prev.tasks.length - 1) return prev;
      const nextTasks = [...prev.tasks];
      const temp = nextTasks[idx];
      nextTasks[idx] = nextTasks[idx + 1];
      nextTasks[idx + 1] = temp;
      return { ...prev, tasks: nextTasks };
    });
  }, [commitChange]);

  // Toggle Milestone
  const toggleMilestone = useCallback((taskId: string) => {
    commitChange((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === taskId) {
          const nextMilestone = !t.milestone;
          return {
            ...t,
            milestone: nextMilestone,
            duration: nextMilestone ? 0 : (t.duration === 0 ? 1 : t.duration),
          };
        }
        return t;
      }),
    }));
    showNotification('تم تغيير حالة المعلم الرئيسي');
  }, [commitChange, showNotification]);

  // Dependency Management
  const addDependency = useCallback((
    predecessorId: string,
    successorId: string,
    type: Dependency['type'] = 'FS',
    hardness: Dependency['hardness'] = 'Strong',
    delay: number = 0
  ): boolean => {
    if (predecessorId === successorId) {
      showNotification('لا يمكن ربط المهمة بنفسها');
      return false;
    }

    if (wouldCreateCycle(predecessorId, successorId, state.dependencies)) {
      showNotification('تنبيه: هذا الرابط ينشئ حلقة دائرية غير صالحة');
      return false;
    }

    // Check duplicate
    const exists = state.dependencies.some(
      (d) => d.predecessorId === predecessorId && d.successorId === successorId
    );
    if (exists) {
      showNotification('هذه التبعية موجودة بالفعل');
      return false;
    }

    commitChange((prev) => ({
      ...prev,
      dependencies: [
        ...prev.dependencies,
        {
          id: `dep_${Date.now()}`,
          predecessorId,
          successorId,
          type,
          hardness,
          delay,
        },
      ],
    }));

    showNotification('تم إنشاء التبعية بنجاح');
    return true;
  }, [state.dependencies, commitChange, showNotification]);

  const removeDependency = useCallback((dependencyId: string) => {
    commitChange((prev) => ({
      ...prev,
      dependencies: prev.dependencies.filter((d) => d.id !== dependencyId),
    }));
    showNotification('تم حذف التبعية');
  }, [commitChange, showNotification]);

  const updateDependency = useCallback((dependencyId: string, updates: Partial<Dependency>) => {
    commitChange((prev) => ({
      ...prev,
      dependencies: prev.dependencies.map((d) => (d.id === dependencyId ? { ...d, ...updates } : d)),
    }));
  }, [commitChange]);

  // Auto-schedule
  const autoSchedule = useCallback(() => {
    commitChange((prev) => {
      const scheduled = autoScheduleTasks(prev.tasks, prev.dependencies, prev.project);
      return { ...prev, tasks: scheduled };
    });
    showNotification('تمت الجدولة التلقائية بنجاح وفق التبعيات');
  }, [commitChange, showNotification]);

  // Resources & Roles
  const addResource = useCallback((name: string, roleId: string): string => {
    const newId = `res_${Date.now()}`;
    commitChange((prev) => ({
      ...prev,
      resources: [...prev.resources, { id: newId, name, roleId }],
    }));
    showNotification(`تمت إضافة المورد "${name}"`);
    return newId;
  }, [commitChange, showNotification]);

  const updateResource = useCallback((resourceId: string, updates: Partial<Resource>) => {
    commitChange((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === resourceId ? { ...r, ...updates } : r)),
    }));
  }, [commitChange]);

  const deleteResource = useCallback((resourceId: string) => {
    commitChange((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== resourceId),
      assignments: prev.assignments.filter((a) => a.resourceId !== resourceId),
    }));
    showNotification('تم حذف المورد وإلغاء تخصيصاته');
  }, [commitChange, showNotification]);

  const addRole = useCallback((name: string): string => {
    const newId = `role_${Date.now()}`;
    commitChange((prev) => ({
      ...prev,
      roles: [...prev.roles, { id: newId, name }],
    }));
    showNotification(`تمت إضافة الدور "${name}"`);
    return newId;
  }, [commitChange, showNotification]);

  const updateRole = useCallback((roleId: string, name: string) => {
    commitChange((prev) => ({
      ...prev,
      roles: prev.roles.map((r) => (r.id === roleId ? { ...r, name } : r)),
    }));
  }, [commitChange]);

  const deleteRole = useCallback((roleId: string) => {
    commitChange((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== roleId),
    }));
    showNotification('تم حذف الدور');
  }, [commitChange, showNotification]);

  // Assignment Management
  const assignResourceToTask = useCallback((taskId: string, resourceId: string, unit: number = 100.0) => {
    commitChange((prev) => {
      const exists = prev.assignments.some((a) => a.taskId === taskId && a.resourceId === resourceId);
      if (exists) return prev;
      return {
        ...prev,
        assignments: [
          ...prev.assignments,
          { id: `asgn_${Date.now()}`, taskId, resourceId, unit },
        ],
      };
    });
    showNotification('تم تخصيص المورد للمهمة بنسبة ' + unit.toFixed(1));
  }, [commitChange, showNotification]);

  const unassignResourceFromTask = useCallback((taskId: string, resourceId: string) => {
    commitChange((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => !(a.taskId === taskId && a.resourceId === resourceId)),
    }));
    showNotification('تم إلغاء تخصيص المورد');
  }, [commitChange, showNotification]);

  const updateAssignmentUnit = useCallback((assignmentId: string, unit: number) => {
    commitChange((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === assignmentId ? { ...a, unit } : a)),
    }));
  }, [commitChange]);

  // Project Metadata
  const updateProjectMetadata = useCallback((updates: Partial<ProjectMetadata>) => {
    commitChange((prev) => ({
      ...prev,
      project: { ...prev.project, ...updates },
    }));
    showNotification('تم تحديث خصائص المشروع');
  }, [commitChange, showNotification]);

  // Student & Stages operations
  const setStudentName = useCallback((name: string) => {
    setProfile((prev) => ({ ...prev, studentName: name.trim() }));
  }, []);

  const setAppScreen = useCallback((screen: AppScreen) => {
    setProfile((prev) => ({ ...prev, appScreen: screen }));
  }, []);

  const setActiveWorkspaceTab = useCallback((tab: WorkspaceTab) => {
    setProfile((prev) => ({ ...prev, activeWorkspaceTab: tab }));
  }, []);

  const selectStage = useCallback((stage: 1 | 2 | 3) => {
    setProfile((prev) => {
      if (!prev.unlockedStages.includes(stage)) {
        showNotification('هذه المرحلة مقفلة حالياً. أكمل المتطلبات أولاً.');
        return prev;
      }

      // If switching to stage 1 and student has not started steps, start from tutorial baseline
      if (stage === 1 && prev.completedTutorialSteps.length === 0) {
        setState(createTutorialStartState());
      } else if (stage === 3 && state.tasks.length < 12) {
        // In free management, give them full school play project if tasks are incomplete
        setState(createInitialProjectState());
      }

      return {
        ...prev,
        currentStage: stage,
        appScreen: 'workspace',
      };
    });
    showNotification(`تم الانتقال إلى المرحلة ${stage}: ${stage === 1 ? 'التعلم الموجّه' : stage === 2 ? 'التحدي المستقل' : 'الإدارة الحرة'}`);
  }, [showNotification, state.tasks.length]);

  const advanceTutorialStep = useCallback(() => {
    const currentIdx = profile.tutorialStepIndex;
    const currentStep = TUTORIAL_STEPS[currentIdx];
    const isAlreadyCompleted = profile.completedTutorialSteps.includes(currentIdx);
    const isValid = currentStep ? currentStep.validate(state, computedTasks) : true;

    if (!isAlreadyCompleted && !isValid) {
      const errMsg = currentStep?.getPedagogicalError?.(state, computedTasks) || currentStep?.actionRequired || 'أكمل المطلوب أولاً.';
      showNotification(errMsg);
      return;
    }

    setProfile((prev) => {
      const nextIndex = Math.min(9, prev.tutorialStepIndex + 1);
      return { ...prev, tutorialStepIndex: nextIndex };
    });
  }, [profile.tutorialStepIndex, profile.completedTutorialSteps, state, computedTasks, showNotification]);

  const previousTutorialStep = useCallback(() => {
    setProfile((prev) => {
      const prevIndex = Math.max(0, prev.tutorialStepIndex - 1);
      return { ...prev, tutorialStepIndex: prevIndex };
    });
  }, []);

  const setTutorialStep = useCallback((index: number) => {
    setProfile((prev) => {
      const maxCompleted = prev.completedTutorialSteps.length > 0 ? Math.max(...prev.completedTutorialSteps) : -1;
      const maxAllowed = Math.max(0, maxCompleted + 1);
      if (index <= maxAllowed || prev.completedTutorialSteps.includes(index)) {
        return { ...prev, tutorialStepIndex: Math.max(0, Math.min(9, index)) };
      }
      showNotification('هذه الخطوة مقفلة حالياً. أكمل الخطوات السابقة أولاً.');
      return prev;
    });
  }, [showNotification]);

  const completeCurrentTutorialStep = useCallback(() => {
    const currentIdx = profile.tutorialStepIndex;
    const currentStep = TUTORIAL_STEPS[currentIdx];

    if (currentStep) {
      const isValid = currentStep.validate(state, computedTasks);
      if (!isValid) {
        const errorMsg =
          currentStep.getPedagogicalError?.(state, computedTasks) ||
          currentStep.actionRequired ||
          'لم يتم إكمال المطلوب لهذه الخطوة بعد. راجع توجيهات نحلة جانت.';
        showNotification(errorMsg);
        return;
      }
    }

    setProfile((prev) => {
      const completed = Array.from(new Set([...prev.completedTutorialSteps, currentIdx]));
      const all10Done = completed.length >= 10;
      let nextUnlocked = [...prev.unlockedStages];

      // If user is on step 9 (Step 10) and all 10 steps are completed -> Finish Stage 1 and transition to Stage Selector!
      if (currentIdx === 9 && all10Done) {
        if (!nextUnlocked.includes(2)) {
          nextUnlocked.push(2);
        }
        showNotification(`تهانينا يا ${prev.studentName}! أنهيت جميع خطوات المرحلة 1 بنجاح وتم فتح المرحلة 2 (التحدي المستقل) 🎉`);
        return {
          ...prev,
          completedTutorialSteps: completed,
          tutorialStepIndex: 9,
          unlockedStages: nextUnlocked,
          appScreen: 'stage_select',
        };
      }

      // If on step 9 but some earlier step was missed
      if (currentIdx === 9 && !all10Done) {
        const firstMissing = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((i) => !completed.includes(i)) ?? 0;
        showNotification(`تنبيه: يجب إكمال جميع الخطوات السابقة أولاً. تم الانتقال للخطوة ${firstMissing + 1}.`);
        return {
          ...prev,
          completedTutorialSteps: completed,
          tutorialStepIndex: firstMissing,
          unlockedStages: nextUnlocked,
        };
      }

      const nextIdx = Math.min(9, currentIdx + 1);
      const nextStepTitle = TUTORIAL_STEPS[nextIdx]?.title || '';
      showNotification(`أحسنت يا ${prev.studentName || 'بطل'}! تم إكمال الخطوة ${currentIdx + 1} بنجاح ✓. التالي: ${nextStepTitle}`);

      return {
        ...prev,
        completedTutorialSteps: completed,
        tutorialStepIndex: nextIdx,
        unlockedStages: nextUnlocked,
      };
    });
  }, [profile.tutorialStepIndex, state, computedTasks, showNotification]);

  const completeStage2 = useCallback(() => {
    setProfile((prev) => {
      const nextUnlocked = Array.from(new Set([...prev.unlockedStages, 3]));
      showNotification(`إنجاز متميز يا ${prev.studentName}! اجتزت التحدي المستقل وتم فتح المرحلة 3 (الإدارة الحرة) 🌟`);
      return {
        ...prev,
        stage2Completed: true,
        unlockedStages: nextUnlocked,
        appScreen: 'stage_select',
      };
    });
  }, [showNotification]);

  const resetStudentProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore
    }
    const resetProfile: StudentProfile = {
      ...DEFAULT_PROFILE,
      studentName: profile.studentName,
      appScreen: 'stage_select',
    };
    setProfile(resetProfile);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(resetProfile));
    } catch {
      // ignore
    }
    const pristine = createTutorialStartState();
    setState(pristine);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pristine));
    } catch {
      // ignore
    }
    showNotification('تمت إعادة ضبط التقدم والمراحل إلى البداية بنجاح');
  }, [profile.studentName, showNotification]);

  const activeTutorialStep = profile.currentStage === 1 ? TUTORIAL_STEPS[profile.tutorialStepIndex] : null;
  const activeHighlightTargetId = activeTutorialStep ? activeTutorialStep.highlightTargetId : null;
  const activeTargetTaskId = activeTutorialStep?.targetTaskId || null;

  // Context value object
  const value: ProjectContextValue = {
    state,
    computedTasks,
    viewSettings,
    profile,
    activeHighlightTargetId,
    activeTargetTaskId,
    setStudentName,
    setAppScreen,
    selectStage,
    setActiveWorkspaceTab,
    advanceTutorialStep,
    previousTutorialStep,
    setTutorialStep,
    completeCurrentTutorialStep,
    completeStage2,
    resetStudentProgress,
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,
    undo,
    redo,
    saveProject,
    resetToEducationalScenario,
    exportProjectJSON,
    importProjectJSON,
    setViewSettings,
    selectTask,
    selectNextTask,
    selectPrevTask,
    toggleCollapseTask,
    addTask,
    updateTask,
    deleteTask,
    indentTask,
    unindentTask,
    moveTaskUp,
    moveTaskDown,
    toggleMilestone,
    reorderTasks,
    setTaskParent,
    addDependency,
    removeDependency,
    updateDependency,
    autoSchedule,
    addResource,
    updateResource,
    deleteResource,
    addRole,
    updateRole,
    deleteRole,
    assignResourceToTask,
    unassignResourceFromTask,
    updateAssignmentUnit,
    updateProjectMetadata,
    notification,
    showNotification,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
