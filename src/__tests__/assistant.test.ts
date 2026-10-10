import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { createTutorialStartState } from '../data/initialProject';
import { computeProjectSchedule } from '../utils/scheduler';
import { buildProjectContextSummary } from '../services/geminiAssistant';
import { StudentProfile } from '../types/project';

describe('GANT Assistant Context & Integration Tests', () => {
  it('buildProjectContextSummary constructs valid JSON context and updates on step change', () => {
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    const profileStep1: StudentProfile = {
      studentName: 'محمد',
      currentStage: 1,
      unlockedStages: [1],
      tutorialStepIndex: 0,
      completedTutorialSteps: [],
      stage2Completed: false,
      stage3Completed: false,
      appScreen: 'workspace',
      activeWorkspaceTab: 'gantt',
    };
    const profileStep2: StudentProfile = {
      ...profileStep1,
      tutorialStepIndex: 1,
    };

    const summaryStr1 = buildProjectContextSummary({
      profile: profileStep1,
      state,
      computedTasks: computed,
      selectedTask: computed[0],
    });

    const summaryStr2 = buildProjectContextSummary({
      profile: profileStep2,
      state,
      computedTasks: computed,
      selectedTask: computed[1],
    });

    expect(typeof summaryStr1).toBe('string');
    const parsed1 = JSON.parse(summaryStr1);
    const parsed2 = JSON.parse(summaryStr2);

    expect(parsed1.studentName).toBe('محمد');
    expect(parsed1.projectOverview.name).toBe('مشروع المسرحية المدرسية');
    expect(parsed1.currentTutorialStep.number).toBe(1);
    expect(parsed2.currentTutorialStep.number).toBe(2);
    expect(parsed1.selectedTask.id).toBe(computed[0].id);
    expect(parsed2.selectedTask.id).toBe(computed[1].id);
  });
});
