import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS } from './tutorialSteps';
import { createTutorialStartState } from './initialProject';
import { computeProjectSchedule } from '../utils/scheduler';

describe('Tutorial Steps Pedagogical Validation (All 10 Steps)', () => {
  it('contains exactly 10 tutorial steps with full pedagogical metadata', () => {
    expect(TUTORIAL_STEPS).toHaveLength(10);
    TUTORIAL_STEPS.forEach((step, idx) => {
      expect(step.number).toBe(idx + 1);
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.whatText.trim().length).toBeGreaterThan(0);
      expect(step.whereText.trim().length).toBeGreaterThan(0);
      expect(step.howText.trim().length).toBeGreaterThan(0);
      expect(step.actionRequired.trim().length).toBeGreaterThan(0);
      expect(step.highlightTargetId.trim().length).toBeGreaterThan(0);
      expect(typeof step.validate).toBe('function');
    });
  });

  it('verifies that baseline state does NOT satisfy any tutorial step initially', () => {
    const baseline = createTutorialStartState();
    const computed = computeProjectSchedule(baseline.tasks, baseline.dependencies, baseline.project);

    TUTORIAL_STEPS.forEach((step) => {
      const isValidInitially = step.validate(baseline, computed);
      expect(isValidInitially).toBe(false);
    });
  });

  it('validates Step 1: Setting weekend to Friday and Saturday [5, 6]', () => {
    const step1 = TUTORIAL_STEPS[0];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step1.validate(state, computed)).toBe(false);

    // Apply required action
    state.project.weekendDays = [5, 6];
    expect(step1.validate(state, computed)).toBe(true);
  });

  it('validates Step 2: Changing script duration or priority', () => {
    const step2 = TUTORIAL_STEPS[1];
    const state = createTutorialStartState();
    let computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step2.validate(state, computed)).toBe(false);

    // Modify script duration and priority
    const script = state.tasks.find((t) => t.id === 'task_script')!;
    script.duration = 7;
    script.priority = 'High';
    computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step2.validate(state, computed)).toBe(true);
  });

  it('validates Step 3: Making Directing a summary task for Music, Scenery, and Costumes', () => {
    const step3 = TUTORIAL_STEPS[2];
    const state = createTutorialStartState();
    let computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step3.validate(state, computed)).toBe(false);

    // Indent tasks
    state.tasks.forEach((t) => {
      if (['task_music', 'task_scenery', 'task_costumes'].includes(t.id)) {
        t.parentId = 'task_directing';
      }
    });
    computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step3.validate(state, computed)).toBe(true);
  });

  it('validates Step 4: Converting Dress Rehearsal to Milestone', () => {
    const step4 = TUTORIAL_STEPS[3];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step4.validate(state, computed)).toBe(false);

    const dress = state.tasks.find((t) => t.id === 'task_dress_rehearsal')!;
    dress.milestone = true;
    dress.duration = 0;
    expect(step4.validate(state, computed)).toBe(true);
  });

  it('validates Step 5: Adjusting rehearsals or lights durations', () => {
    const step5 = TUTORIAL_STEPS[4];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step5.validate(state, computed)).toBe(false);

    const rehearsals = state.tasks.find((t) => t.id === 'task_rehearsals')!;
    rehearsals.duration = 6;
    const lights = state.tasks.find((t) => t.id === 'task_lights')!;
    lights.duration = 3;
    expect(step5.validate(state, computed)).toBe(true);
  });

  it('validates Step 6: Adding a project resource', () => {
    const step6 = TUTORIAL_STEPS[5];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step6.validate(state, computed)).toBe(false);

    state.resources.push({ id: 'res_zayd', name: 'زيد', roleId: 'role_actor' });
    state.resources.push({ id: 'res_omar', name: 'عمر', roleId: 'role_actor' });
    expect(step6.validate(state, computed)).toBe(true);
  });

  it('validates Step 7: Assigning Project Manager role to Mohammed', () => {
    const step7 = TUTORIAL_STEPS[6];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step7.validate(state, computed)).toBe(false);

    const mohammed = state.resources.find((r) => r.id === 'res_mohammed')!;
    mohammed.roleId = 'role_pm';
    expect(step7.validate(state, computed)).toBe(true);
  });

  it('validates Step 8: Assigning resource to a project task', () => {
    const step8 = TUTORIAL_STEPS[7];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step8.validate(state, computed)).toBe(false);

    state.assignments.push({
      id: 'asgn_1',
      taskId: 'task_directing',
      resourceId: 'res_saad',
      unit: 100,
    });
    state.assignments.push({
      id: 'asgn_2',
      taskId: 'task_music',
      resourceId: 'res_mohammed',
      unit: 100,
    });
    expect(step8.validate(state, computed)).toBe(true);
  });

  it('validates Step 9: Adding FS dependency between cast and script reading', () => {
    const step9 = TUTORIAL_STEPS[8];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step9.validate(state, computed)).toBe(false);

    state.dependencies.push({
      id: 'dep_1',
      predecessorId: 'task_cast',
      successorId: 'task_script_reading',
      type: 'FS',
      hardness: 'Strong',
      delay: 0,
    });
    expect(step9.validate(state, computed)).toBe(true);
  });

  it('validates Step 10: Modifying task script start date', () => {
    const step10 = TUTORIAL_STEPS[9];
    const state = createTutorialStartState();
    const computed = computeProjectSchedule(state.tasks, state.dependencies, state.project);
    expect(step10.validate(state, computed)).toBe(false);

    const script = state.tasks.find((t) => t.id === 'task_script')!;
    script.startDate = '2026-10-12';
    expect(step10.validate(state, computed)).toBe(true);
  });
});
