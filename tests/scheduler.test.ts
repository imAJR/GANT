import assert from 'node:assert/strict';
import { test } from 'vitest';
import type { Dependency, ProjectMetadata, Task } from '../src/types/project';
import {
  autoScheduleTasks,
  computeProjectSchedule,
  wouldCreateCycle,
} from '../src/utils/scheduler';
import {
  alignToWorkingDay,
  calculateEndDate,
  calculateWorkingDaysBetween,
} from '../src/utils/calendar';

const project: ProjectMetadata = {
  id: 'test-project',
  name: 'اختبار الجدولة',
  organization: 'GANT tests',
  description: '',
  webLink: '',
  startDate: '2026-10-11',
  weekendDays: [5, 6],
  designer: '',
  year: 2026,
};

function task(id: string, startDate: string, duration: number): Task {
  return {
    id,
    name: id,
    parentId: null,
    startDate,
    duration,
    priority: 'Normal',
    progress: 0,
    milestone: false,
  };
}

test('calendar aligns weekend dates to the next working day', () => {
  assert.equal(alignToWorkingDay('2026-10-16', [5, 6]), '2026-10-18');
  assert.equal(alignToWorkingDay('2026-10-17', [5, 6]), '2026-10-18');
});

test('calendar calculates inclusive working-day durations', () => {
  assert.equal(calculateEndDate('2026-10-15', 2, [5, 6]), '2026-10-18');
  assert.equal(calculateEndDate('2026-10-15', 0, [5, 6]), '2026-10-15');
  assert.equal(calculateWorkingDaysBetween('2026-10-15', '2026-10-18', [5, 6]), 2);
});

test('schedule computes task end dates while excluding Friday and Saturday', () => {
  const tasks = [task('predecessor', '2026-10-15', 2), task('successor', '2026-10-18', 1)];
  const computed = computeProjectSchedule(tasks, [], project);
  assert.equal(computed.find((item) => item.id === 'predecessor')?.endDate, '2026-10-18');
  assert.equal(computed.find((item) => item.id === 'successor')?.endDate, '2026-10-18');
});

test('finish-to-start scheduling moves successor after predecessor ends', () => {
  const tasks = [task('predecessor', '2026-10-15', 2), task('successor', '2026-10-11', 1)];
  const dependencies: Dependency[] = [{
    id: 'dep-1',
    predecessorId: 'predecessor',
    successorId: 'successor',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  }];

  const scheduled = autoScheduleTasks(tasks, dependencies, project);
  assert.equal(scheduled.find((item) => item.id === 'successor')?.startDate, '2026-10-19');
});

test('dependency cycle detection rejects self-links and indirect cycles', () => {
  assert.equal(wouldCreateCycle('task-a', 'task-a', []), true);
  const existing: Dependency[] = [{
    id: 'dep-1',
    predecessorId: 'task-b',
    successorId: 'task-c',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  }, {
    id: 'dep-2',
    predecessorId: 'task-c',
    successorId: 'task-a',
    type: 'FS',
    hardness: 'Strong',
    delay: 0,
  }];
  assert.equal(wouldCreateCycle('task-a', 'task-b', existing), true);
  assert.equal(wouldCreateCycle('task-a', 'task-d', existing), false);
});


test('finish-to-finish scheduling preserves duration when moving a successor', () => {
  const tasks = [task('predecessor', '2026-10-18', 3), task('successor', '2026-10-11', 2)];
  const dependencies: Dependency[] = [{
    id: 'dep-ff', predecessorId: 'predecessor', successorId: 'successor',
    type: 'FF', hardness: 'Strong', delay: 0,
  }];
  const scheduled = autoScheduleTasks(tasks, dependencies, project);
  const computed = computeProjectSchedule(scheduled, dependencies, project);
  assert.equal(computed.find((item) => item.id === 'successor')?.endDate, '2026-10-20');
  assert.equal(scheduled.find((item) => item.id === 'successor')?.duration, 2);
});

test('start-to-finish scheduling preserves successor duration', () => {
  const tasks = [task('predecessor', '2026-10-20', 1), task('successor', '2026-10-11', 2)];
  const dependencies: Dependency[] = [{
    id: 'dep-sf', predecessorId: 'predecessor', successorId: 'successor',
    type: 'SF', hardness: 'Strong', delay: 0,
  }];
  const scheduled = autoScheduleTasks(tasks, dependencies, project);
  const computed = computeProjectSchedule(scheduled, dependencies, project);
  assert.equal(computed.find((item) => item.id === 'successor')?.endDate, '2026-10-20');
  assert.equal(scheduled.find((item) => item.id === 'successor')?.duration, 2);
});
