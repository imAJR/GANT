import { describe, it, expect } from 'vitest';
import { sanitizeAndValidateProjectJSON } from './projectValidator';
import { INITIAL_PROJECT_METADATA } from '../data/initialProject';

describe('Project Import & Integrity Validator', () => {
  it('validates a correct and clean project JSON structure', () => {
    const validJSON = {
      project: {
        id: 'proj_school',
        name: 'مشروع المسرحية المدرسية',
        startDate: '2026-10-11',
        weekendDays: [5, 6],
      },
      tasks: [
        {
          id: 'task_1',
          name: 'كتابة السيناريو',
          startDate: '2026-10-11',
          duration: 5,
          priority: 'High',
          progress: 50,
          milestone: false,
        },
      ],
      roles: [{ id: 'role_writer', name: 'كاتب' }],
      resources: [{ id: 'res_1', name: 'سعد', roleId: 'role_writer' }],
      assignments: [{ id: 'asgn_1', taskId: 'task_1', resourceId: 'res_1', unit: 100 }],
      dependencies: [],
    };

    const result = sanitizeAndValidateProjectJSON(validJSON);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedState).toBeDefined();
    expect(result.sanitizedState?.project.name).toBe('مشروع المسرحية المدرسية');
    expect(result.sanitizedState?.tasks).toHaveLength(1);
    expect(result.sanitizedState?.tasks[0].id).toBe('task_1');
  });

  it('rejects corrupt, empty, or non-object JSON payloads', () => {
    expect(sanitizeAndValidateProjectJSON(null).isValid).toBe(false);
    expect(sanitizeAndValidateProjectJSON(undefined).isValid).toBe(false);
    expect(sanitizeAndValidateProjectJSON('').isValid).toBe(false);
    expect(sanitizeAndValidateProjectJSON([]).isValid).toBe(false);
    expect(sanitizeAndValidateProjectJSON('some string').isValid).toBe(false);
    expect(sanitizeAndValidateProjectJSON({}).isValid).toBe(false); // missing tasks array
  });

  it('safely handles missing or invalid project start date', () => {
    const jsonWithoutStart = {
      project: { name: 'بدون تاريخ بدء' },
      tasks: [{ id: 't1', name: 'مهمة' }],
    };
    const res1 = sanitizeAndValidateProjectJSON(jsonWithoutStart);
    expect(res1.isValid).toBe(true);
    expect(res1.sanitizedState?.project.startDate).toBe(INITIAL_PROJECT_METADATA.startDate);

    const jsonWithInvalidDate = {
      project: { name: 'تاريخ غير صالح', startDate: '2026-02-31' },
      tasks: [{ id: 't1', name: 'مهمة' }],
    };
    const res2 = sanitizeAndValidateProjectJSON(jsonWithInvalidDate);
    expect(res2.isValid).toBe(true);
    expect(res2.sanitizedState?.project.startDate).toBe(INITIAL_PROJECT_METADATA.startDate);
  });

  it('safely handles impossible calendar dates in tasks', () => {
    const jsonWithBadDates = {
      project: { startDate: '2026-10-11' },
      tasks: [
        { id: 't1', name: 'مهمة 1', startDate: '2026-13-45' }, // Impossible month and day
        { id: 't2', name: 'مهمة 2', startDate: '2026-04-31' }, // April 31 does not exist
      ],
    };
    const res = sanitizeAndValidateProjectJSON(jsonWithBadDates);
    expect(res.isValid).toBe(true);
    // Should fallback to project start date aligned to working day
    expect(res.sanitizedState?.tasks[0].startDate).toBe('2026-10-11');
    expect(res.sanitizedState?.tasks[1].startDate).toBe('2026-10-11');
  });

  it('populates missing optional task fields with strict defaults', () => {
    const jsonMinimalTask = {
      project: { startDate: '2026-10-11' },
      tasks: [{ id: 't1' }], // Missing name, duration, priority, progress, milestone
    };
    const res = sanitizeAndValidateProjectJSON(jsonMinimalTask);
    expect(res.isValid).toBe(true);
    const task = res.sanitizedState?.tasks[0]!;
    expect(task.name).toBe('مهمة 1');
    expect(task.duration).toBe(1);
    expect(task.priority).toBe('Normal');
    expect(task.progress).toBe(0);
    expect(task.milestone).toBe(false);
    expect(task.parentId).toBeNull();
  });

  it('deduplicates task IDs seamlessly', () => {
    const jsonDuplicateIds = {
      project: { startDate: '2026-10-11' },
      tasks: [
        { id: 'task_dup', name: 'الأولى' },
        { id: 'task_dup', name: 'الثانية المكررة' },
        { id: 'task_dup', name: 'الثالثة المكررة' },
      ],
    };
    const res = sanitizeAndValidateProjectJSON(jsonDuplicateIds);
    expect(res.isValid).toBe(true);
    const ids = res.sanitizedState?.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids![0]).toBe('task_dup');
    expect(ids![1]).toBe('task_dup_dup_1');
  });

  it('cleans dangling or cyclic parentId references', () => {
    const jsonBadParents = {
      project: { startDate: '2026-10-11' },
      tasks: [
        { id: 't1', name: 'T1', parentId: 'non_existent_parent' },
        { id: 't2', name: 'T2', parentId: 't2' }, // Self-parenting
        { id: 't3', name: 'T3', parentId: 't4' },
        { id: 't4', name: 'T4', parentId: 't3' }, // Cycle A -> B -> A
      ],
    };
    const res = sanitizeAndValidateProjectJSON(jsonBadParents);
    expect(res.isValid).toBe(true);
    const tasks = res.sanitizedState?.tasks!;
    expect(tasks[0].parentId).toBeNull(); // Dangling parent removed
    expect(tasks[1].parentId).toBeNull(); // Self reference removed
    // Cycle broken
    const t3 = tasks.find((t) => t.id === 't3');
    const t4 = tasks.find((t) => t.id === 't4');
    expect(t3?.parentId === null || t4?.parentId === null).toBe(true);
  });

  it('skips invalid, dangling, or duplicate resource assignments', () => {
    const jsonAssignments = {
      project: { startDate: '2026-10-11' },
      tasks: [{ id: 't1', name: 'T1' }],
      roles: [{ id: 'r1', name: 'دور' }],
      resources: [{ id: 'res1', name: 'مورد 1', roleId: 'r1' }],
      assignments: [
        { id: 'a1', taskId: 't1', resourceId: 'res1', unit: 100 },
        { id: 'a2', taskId: 't1', resourceId: 'res1', unit: 50 }, // Duplicate pair
        { id: 'a3', taskId: 'non_existent_task', resourceId: 'res1', unit: 100 }, // Dangling task
        { id: 'a4', taskId: 't1', resourceId: 'non_existent_res', unit: 100 }, // Dangling resource
        { id: 'a5', taskId: 't1', resourceId: 'res1', unit: -50 }, // Negative unit
      ],
    };
    const res = sanitizeAndValidateProjectJSON(jsonAssignments);
    expect(res.isValid).toBe(true);
    // Only the first valid assignment should be accepted
    expect(res.sanitizedState?.assignments).toHaveLength(1);
    expect(res.sanitizedState?.assignments[0].taskId).toBe('t1');
    expect(res.sanitizedState?.assignments[0].resourceId).toBe('res1');
  });

  it('skips invalid dependencies and breaks circular dependencies', () => {
    const jsonDeps = {
      project: { startDate: '2026-10-11' },
      tasks: [
        { id: 't1', name: 'T1' },
        { id: 't2', name: 'T2' },
        { id: 't3', name: 'T3' },
      ],
      dependencies: [
        { id: 'd1', predecessorId: 't1', successorId: 't2', type: 'FS' },
        { id: 'd2', predecessorId: 't2', successorId: 't1', type: 'FS' }, // Direct cycle t2 -> t1
        { id: 'd3', predecessorId: 't1', successorId: 't1', type: 'FS' }, // Self link
        { id: 'd4', predecessorId: 't1', successorId: 'ghost', type: 'FS' }, // Dangling successor
      ],
    };
    const res = sanitizeAndValidateProjectJSON(jsonDeps);
    expect(res.isValid).toBe(true);
    // Only d1 should be accepted, d2 (cycle), d3 (self-link), d4 (dangling) rejected
    expect(res.sanitizedState?.dependencies).toHaveLength(1);
    expect(res.sanitizedState?.dependencies[0].predecessorId).toBe('t1');
    expect(res.sanitizedState?.dependencies[0].successorId).toBe('t2');
  });
});
