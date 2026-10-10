import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createTutorialStartState } from '../src/data/initialProject';
import { STAGE_2_OBJECTIVES, TUTORIAL_STEPS } from '../src/data/tutorialSteps';
import type { ComputedTask } from '../src/types/project';

test('tutorial starts with all ten steps requiring student action', () => {
  const state = createTutorialStartState();
  const computed = [] as ComputedTask[];

  assert.equal(TUTORIAL_STEPS.length, 10);
  for (const step of TUTORIAL_STEPS) {
    assert.equal(step.validate(state, computed), false, `step ${step.number} should not pass initially`);
  }
});

test('step 1 validates Friday/Saturday weekend configuration', () => {
  const state = createTutorialStartState();
  state.project.weekendDays = [0, 5, 6];
  assert.equal(TUTORIAL_STEPS[0].validate(state, []), false);
  state.project.weekendDays = [5, 6];
  assert.equal(TUTORIAL_STEPS[0].validate(state, []), true);
});

test('step 2 requires both a changed duration and priority', () => {
  const state = createTutorialStartState();
  const script = state.tasks.find((task) => task.id === 'task_script')!;
  script.duration = 8;
  assert.equal(TUTORIAL_STEPS[1].validate(state, []), false);
  script.priority = 'Highest';
  assert.equal(TUTORIAL_STEPS[1].validate(state, []), true);
});

test('step 3 requires all three directing subtasks', () => {
  const state = createTutorialStartState();
  const computed = [{
    id: 'task_directing',
    hasChildren: true,
    childrenIds: ['task_music', 'task_scenery', 'task_costumes'],
  }] as ComputedTask[];
  assert.equal(TUTORIAL_STEPS[2].validate(state, computed), true);

  const incompleteChildren = [
    { ids: ['task_music', 'task_scenery'], missingLabel: 'الأزياء' },
    { ids: ['task_music', 'task_costumes'], missingLabel: 'المشهد' },
    { ids: ['task_scenery', 'task_costumes'], missingLabel: 'الموسيقى' },
  ];

  for (const scenario of incompleteChildren) {
    const computedMissing = [{
      id: 'task_directing',
      hasChildren: true,
      childrenIds: scenario.ids,
    }] as ComputedTask[];
    assert.equal(TUTORIAL_STEPS[2].validate(state, computedMissing), false);
    assert.match(
      TUTORIAL_STEPS[2].getPedagogicalError!(state, computedMissing) ?? '',
      new RegExp(scenario.missingLabel),
    );
  }
});

test('step 4 requires a zero-duration milestone', () => {
  const state = createTutorialStartState();
  const dress = state.tasks.find((task) => task.id === 'task_dress_rehearsal')!;
  dress.milestone = true;
  dress.duration = 2;
  assert.equal(TUTORIAL_STEPS[3].validate(state, []), false);
  dress.duration = 0;
  assert.equal(TUTORIAL_STEPS[3].validate(state, []), true);
});

test('step 5 requires both rehearsal and lighting durations to change', () => {
  const state = createTutorialStartState();
  state.tasks.find((task) => task.id === 'task_rehearsals')!.duration = 8;
  assert.equal(TUTORIAL_STEPS[4].validate(state, []), false);
  state.tasks.find((task) => task.id === 'task_lights')!.duration = 4;
  assert.equal(TUTORIAL_STEPS[4].validate(state, []), true);
});

test('step 6 requires an additional resource', () => {
  const state = createTutorialStartState();
  assert.equal(TUTORIAL_STEPS[5].validate(state, []), false);
  state.resources.push({ id: 'res_new', name: 'عضو جديد', roleId: 'role_actor' });
  assert.equal(TUTORIAL_STEPS[5].validate(state, []), true);
});

test('step 7 requires Mohammed to have the project manager role', () => {
  const state = createTutorialStartState();
  assert.equal(TUTORIAL_STEPS[6].validate(state, []), false);
  state.resources.find((resource) => resource.id === 'res_mohammed')!.roleId = 'role_pm';
  assert.equal(TUTORIAL_STEPS[6].validate(state, []), true);
});

test('step 8 requires a valid task-resource assignment', () => {
  const state = createTutorialStartState();
  assert.equal(TUTORIAL_STEPS[7].validate(state, []), false);
  state.assignments.push({
    id: 'assignment_invalid_task',
    taskId: 'missing_task',
    resourceId: 'res_bilal',
    unit: 100,
  });
  assert.equal(TUTORIAL_STEPS[7].validate(state, []), false);
  state.assignments = [{
    id: 'assignment_invalid_resource',
    taskId: 'task_script',
    resourceId: 'missing_resource',
    unit: 100,
  }];
  assert.equal(TUTORIAL_STEPS[7].validate(state, []), false);
  state.assignments = [{
    id: 'assignment_invalid_unit',
    taskId: 'task_script',
    resourceId: 'res_bilal',
    unit: 0,
  }];
  assert.equal(TUTORIAL_STEPS[7].validate(state, []), false);
  state.assignments = [];
  state.assignments.push({
    id: 'assignment_test',
    taskId: 'task_script',
    resourceId: 'res_bilal',
    unit: 100,
  });
  assert.equal(TUTORIAL_STEPS[7].validate(state, []), true);
});

test('step 9 requires a strong finish-to-start dependency in the right direction', () => {
  const state = createTutorialStartState();
  state.dependencies.push({
    id: 'dependency_wrong_direction',
    predecessorId: 'task_script_reading',
    successorId: 'task_cast',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  });
  assert.equal(TUTORIAL_STEPS[8].validate(state, []), false);
  state.dependencies = [{
    id: 'dependency_wrong_type',
    predecessorId: 'task_cast',
    successorId: 'task_script_reading',
    type: 'SS',
    hardness: 'Strong',
    delay: 0,
  }];
  assert.equal(TUTORIAL_STEPS[8].validate(state, []), false);
  state.dependencies[0] = {
    id: 'dependency_test',
    predecessorId: 'task_cast',
    successorId: 'task_script_reading',
    type: 'FS',
    hardness: 'Normal',
    delay: 0,
  };
  assert.equal(TUTORIAL_STEPS[8].validate(state, []), false);
  state.dependencies[0].hardness = 'Strong';
  assert.equal(TUTORIAL_STEPS[8].validate(state, []), true);
});

test('step 10 requires a changed script start date', () => {
  const state = createTutorialStartState();
  assert.equal(TUTORIAL_STEPS[9].validate(state, []), false);
  state.tasks.find((task) => task.id === 'task_script')!.startDate = '2026-10-12';
  assert.equal(TUTORIAL_STEPS[9].validate(state, []), true);
});


test('stage 2 milestone objective also requires zero duration', () => {
  const state = createTutorialStartState();
  const dress = state.tasks.find((task) => task.id === 'task_dress_rehearsal')!;
  const objective = STAGE_2_OBJECTIVES.find((item) => item.id === 'obj_dress_milestone')!;

  dress.milestone = true;
  dress.duration = 2;
  assert.equal(objective.check(state, []), false);
  dress.duration = 0;
  assert.equal(objective.check(state, []), true);
});
