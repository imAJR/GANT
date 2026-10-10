import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInitialProjectState, createTutorialStartState } from '../data/initialProject';
import { sanitizeAndValidateProjectJSON } from '../utils/projectValidator';
import { askGanttBeeAssistant } from '../services/geminiAssistant';

// Mock localStorage for node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('GANT Hardening & Regression Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Task deletion cleans up child tasks, dependencies, and resource assignments', () => {
    let state = createInitialProjectState();
    const parentId = 'task_parent_1';
    state.tasks.push({
      id: parentId,
      name: 'مهمة رئيسية',
      startDate: '2026-10-09',
      duration: 5,
      progress: 0,
      priority: 'Normal',
      summary: true,
      milestone: false,
      parentId: null,
    });

    const childId = 'task_child_1';
    state.tasks.push({
      id: childId,
      name: 'مهمة فرعية',
      startDate: '2026-10-09',
      duration: 2,
      progress: 0,
      priority: 'Normal',
      summary: false,
      milestone: false,
      parentId: parentId,
    });

    state.dependencies.push({
      id: 'dep_1',
      predecessorId: childId,
      successorId: 'task_other',
      type: 'FS',
      hardness: 'Strong',
      delay: 0,
    });

    state.assignments.push({
      id: 'asg_1',
      taskId: childId,
      resourceId: 'res_1',
      unit: 100,
    });

    const childrenIds = state.tasks.filter((t) => t.parentId === parentId).map((t) => t.id);
    const allToRemove = new Set<string>([parentId, ...childrenIds]);

    const cleanedTasks = state.tasks.filter((t) => !allToRemove.has(t.id));
    const cleanedAssignments = state.assignments.filter((a) => !allToRemove.has(a.taskId));
    const cleanedDependencies = state.dependencies.filter(
      (d) => !allToRemove.has(d.predecessorId) && !allToRemove.has(d.successorId)
    );

    expect(cleanedTasks.find((t) => t.id === parentId)).toBeUndefined();
    expect(cleanedTasks.find((t) => t.id === childId)).toBeUndefined();
    expect(cleanedAssignments.find((a) => a.taskId === childId)).toBeUndefined();
    expect(cleanedDependencies.find((d) => d.predecessorId === childId)).toBeUndefined();
  });

  it('2. LocalStorage persistence and validation/sanitization handling', () => {
    const initialState = createInitialProjectState();
    localStorage.setItem('GANT_PROJECT_STATE_2026', JSON.stringify(initialState));

    const savedRaw = localStorage.getItem('GANT_PROJECT_STATE_2026');
    expect(savedRaw).not.toBeNull();

    const parsed = JSON.parse(savedRaw!);
    const validated = sanitizeAndValidateProjectJSON(parsed);
    expect(validated.isValid).toBe(true);
    expect(validated.sanitizedState).toBeDefined();
    expect(validated.sanitizedState?.tasks.length).toBe(initialState.tasks.length);

    localStorage.setItem('GANT_PROJECT_STATE_2026', '{ invalid json ...');
    const corruptedRaw = localStorage.getItem('GANT_PROJECT_STATE_2026');
    let loadFailed = false;
    try {
      JSON.parse(corruptedRaw!);
    } catch {
      loadFailed = true;
    }
    expect(loadFailed).toBe(true);
  });

  it('3. Assistant fallback behavior when API key is absent', async () => {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
      const state = createTutorialStartState();
      const result = await askGanttBeeAssistant('كيف أضيف مهمة جديدة؟', [], {
        profile: {
          studentName: 'سارة',
          currentStage: 1,
          unlockedStages: [1],
          tutorialStepIndex: 0,
          completedTutorialSteps: [],
          stage2Completed: false,
          stage3Completed: false,
          appScreen: 'stage_select',
          activeWorkspaceTab: 'gantt',
        },
        state,
        computedTasks: [],
      });

      expect(result.source).toBe('fallback');
      expect(result.text).toContain('مهمة جديدة');
      expect(result.actions).toBeDefined();
    } finally {
      if (oldKey) process.env.GEMINI_API_KEY = oldKey;
    }
  });
});
