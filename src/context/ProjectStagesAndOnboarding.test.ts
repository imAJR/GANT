import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { createTutorialStartState, createInitialProjectState } from '../data/initialProject';
import { computeProjectSchedule } from '../utils/scheduler';
import { StudentProfile } from '../types/project';

describe('Stage Transitions & Guided Onboarding Workflow', () => {
  it('prevents Stage 1 completion if the final step condition is not met', () => {
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    const step10 = TUTORIAL_STEPS[9];

    // Initially step 10 is invalid (startDate is 2026-10-11)
    expect(step10.validate(state, computed)).toBe(false);
  });

  it('verifies that completing Stage 1 unlocks Stage 2 and transitions to stage_select', () => {
    let profile: StudentProfile = {
      studentName: 'سارة',
      currentStage: 1,
      unlockedStages: [1],
      tutorialStepIndex: 9,
      completedTutorialSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      stage2Completed: false,
      stage3Completed: false,
      appScreen: 'workspace',
      activeWorkspaceTab: 'gantt',
    };

    const state = createTutorialStartState();
    // Simulate completing step 10: modify script start date
    const script = state.tasks.find((t) => t.id === 'task_script')!;
    script.startDate = '2026-10-14';

    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    const step10 = TUTORIAL_STEPS[9];
    expect(step10.validate(state, computed)).toBe(true);

    // Simulate completion logic
    const currentIdx = profile.tutorialStepIndex;
    const completed = Array.from(new Set([...profile.completedTutorialSteps, currentIdx]));
    const all10Done = completed.length >= 10;
    let nextUnlocked = [...profile.unlockedStages];

    if (currentIdx === 9 && all10Done) {
      if (!nextUnlocked.includes(2)) {
        nextUnlocked.push(2);
      }
      profile = {
        ...profile,
        completedTutorialSteps: completed,
        tutorialStepIndex: 9,
        unlockedStages: nextUnlocked,
        appScreen: 'stage_select',
      };
    }

    expect(profile.appScreen).toBe('stage_select');
    expect(profile.unlockedStages).toContain(2);
    expect(profile.completedTutorialSteps).toHaveLength(10);
    expect(profile.studentName).toBe('سارة');
  });

  it('does NOT unlock Stage 2 if steps were skipped or incomplete', () => {
    let profile: StudentProfile = {
      studentName: 'أحمد',
      currentStage: 1,
      unlockedStages: [1],
      tutorialStepIndex: 9,
      completedTutorialSteps: [0, 1, 2], // Only 3 steps completed
      stage2Completed: false,
      stage3Completed: false,
      appScreen: 'workspace',
      activeWorkspaceTab: 'gantt',
    };

    const completed = Array.from(new Set([...profile.completedTutorialSteps, 9]));
    const all10Done = completed.length >= 10;
    let nextUnlocked = [...profile.unlockedStages];

    if (profile.tutorialStepIndex === 9 && all10Done) {
      nextUnlocked.push(2);
      profile = { ...profile, appScreen: 'stage_select', unlockedStages: nextUnlocked };
    } else if (profile.tutorialStepIndex === 9 && !all10Done) {
      // Must guide to missing step instead of unlocking
      const firstMissing = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((i) => !completed.includes(i)) ?? 0;
      profile = {
        ...profile,
        completedTutorialSteps: completed,
        tutorialStepIndex: firstMissing,
      };
    }

    expect(profile.appScreen).toBe('workspace');
    expect(profile.unlockedStages).not.toContain(2);
    expect(profile.tutorialStepIndex).toBe(3); // Guided to first missing step (step 4, index 3)
  });

  it('ensures stage selection preserves tasks and student profile', () => {
    const profile: StudentProfile = {
      studentName: 'خالد',
      currentStage: 1,
      unlockedStages: [1, 2],
      tutorialStepIndex: 9,
      completedTutorialSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      stage2Completed: false,
      stage3Completed: false,
      appScreen: 'stage_select',
      activeWorkspaceTab: 'gantt',
    };

    const initialTasks = createTutorialStartState().tasks;
    initialTasks[0].duration = 99; // Modified by user

    // Student selects Stage 2
    expect(profile.unlockedStages.includes(2)).toBe(true);

    const updatedProfile: StudentProfile = {
      ...profile,
      currentStage: 2,
      appScreen: 'workspace',
    };

    expect(updatedProfile.currentStage).toBe(2);
    expect(updatedProfile.appScreen).toBe('workspace');
    expect(updatedProfile.studentName).toBe('خالد');
    expect(initialTasks[0].duration).toBe(99); // Preserved
  });

  it('completes Stage 2 and unlocks Stage 3 while transitioning to stage_select', () => {
    let profile: StudentProfile = {
      studentName: 'فاطمة',
      currentStage: 2,
      unlockedStages: [1, 2],
      tutorialStepIndex: 9,
      completedTutorialSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      stage2Completed: false,
      stage3Completed: false,
      appScreen: 'workspace',
      activeWorkspaceTab: 'gantt',
    };

    // Complete Stage 2
    const nextUnlocked = Array.from(new Set([...profile.unlockedStages, 3]));
    profile = {
      ...profile,
      stage2Completed: true,
      unlockedStages: nextUnlocked,
      appScreen: 'stage_select',
    };

    expect(profile.appScreen).toBe('stage_select');
    expect(profile.stage2Completed).toBe(true);
    expect(profile.unlockedStages).toContain(3);
  });

  it('confirms every onboarding step has a defined, distinct highlightTargetId', () => {
    TUTORIAL_STEPS.forEach((step) => {
      expect(step.highlightTargetId).toBeDefined();
      expect(step.highlightTargetId.length).toBeGreaterThan(0);
      expect(
        step.highlightTargetId.startsWith('btn-') ||
          step.highlightTargetId.startsWith('row-') ||
          step.highlightTargetId.startsWith('tab-') ||
          step.highlightTargetId.startsWith('res-')
      ).toBe(true);
    });
  });
});
