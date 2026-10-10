import { describe, it, expect } from 'vitest';
import {
  computeProjectSchedule,
  autoScheduleTasks,
  wouldCreateCycle,
} from './scheduler';
import { Task, Dependency, ProjectMetadata } from '../types/project';

const baseProject: ProjectMetadata = {
  id: 'test_proj',
  name: 'مشروع الاختبار',
  organization: 'مدرسة GANT',
  description: 'وصف المشروع',
  webLink: '',
  startDate: '2026-10-11',
  weekendDays: [5, 6], // Fri & Sat weekend
  designer: 'علي بن حامد الجبرتي',
  year: 2026,
};

describe('Scheduler Engine & Dependency Relationships', () => {
  describe('computeProjectSchedule', () => {
    it('computes leaf task dates and durations correctly', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          name: 'Task 1',
          startDate: '2026-10-11',
          duration: 3,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
      ];
      const computed = computeProjectSchedule(tasks, [], baseProject);
      expect(computed).toHaveLength(1);
      expect(computed[0].startDate).toBe('2026-10-11');
      // 3 working days starting Sun: Sun, Mon, Tue -> 2026-10-13
      expect(computed[0].endDate).toBe('2026-10-13');
      expect(computed[0].duration).toBe(3);
    });

    it('computes summary task start/end boundaries from its children', () => {
      const tasks: Task[] = [
        {
          id: 'parent',
          name: 'Parent Summary',
          startDate: '2026-10-11',
          duration: 1,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: true,
          parentId: null,
        },
        {
          id: 'child1',
          name: 'Child 1',
          startDate: '2026-10-11',
          duration: 2, // ends 2026-10-12
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: 'parent',
        },
        {
          id: 'child2',
          name: 'Child 2',
          startDate: '2026-10-13',
          duration: 2, // ends 2026-10-14
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: 'parent',
        },
      ];

      const computed = computeProjectSchedule(tasks, [], baseProject);
      const parentComputed = computed.find((t) => t.id === 'parent');
      expect(parentComputed).toBeDefined();
      expect(parentComputed?.summary).toBe(true);
      expect(parentComputed?.hasChildren).toBe(true);
      expect(parentComputed?.startDate).toBe('2026-10-11');
      expect(parentComputed?.endDate).toBe('2026-10-14');
      // Sun (11), Mon (12), Tue (13), Wed (14) = 4 working days
      expect(parentComputed?.duration).toBe(4);
    });
  });

  describe('autoScheduleTasks - Dependencies (FS, SS, FF, SF)', () => {
    it('enforces Finish-to-Start (FS) dependency', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          name: 'Predecessor',
          startDate: '2026-10-11', // Sun
          duration: 2, // Ends Mon 2026-10-12
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
        {
          id: 't2',
          name: 'Successor',
          startDate: '2026-10-11', // Initially overlapping
          duration: 2,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
      ];
      const deps: Dependency[] = [
        {
          id: 'd1',
          predecessorId: 't1',
          successorId: 't2',
          type: 'FS',
          hardness: 'Strong',
          delay: 0,
        },
      ];

      const scheduled = autoScheduleTasks(tasks, deps, baseProject);
      const t2 = scheduled.find((t) => t.id === 't2')!;
      // Next working day after Mon Oct 12 is Tue Oct 13
      expect(t2.startDate).toBe('2026-10-13');
    });

    it('enforces FS with positive lag across weekend', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          name: 'Task Thursday',
          startDate: '2026-10-15', // Thu
          duration: 1, // Ends Thu 2026-10-15
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
        {
          id: 't2',
          name: 'Successor',
          startDate: '2026-10-11',
          duration: 1,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
      ];
      // Delay = 0: next working day after Thu is Sun Oct 18 (Fri/Sat skipped)
      const deps: Dependency[] = [
        {
          id: 'd1',
          predecessorId: 't1',
          successorId: 't2',
          type: 'FS',
          hardness: 'Strong',
          delay: 0,
        },
      ];

      const scheduled = autoScheduleTasks(tasks, deps, baseProject);
      const t2 = scheduled.find((t) => t.id === 't2')!;
      expect(t2.startDate).toBe('2026-10-18');
    });

    it('enforces Start-to-Start (SS) dependency', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          name: 'Predecessor',
          startDate: '2026-10-13', // Tue
          duration: 3,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
        {
          id: 't2',
          name: 'Successor',
          startDate: '2026-10-11', // Earlier
          duration: 2,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
      ];
      const deps: Dependency[] = [
        {
          id: 'd1',
          predecessorId: 't1',
          successorId: 't2',
          type: 'SS',
          hardness: 'Strong',
          delay: 0,
        },
      ];

      const scheduled = autoScheduleTasks(tasks, deps, baseProject);
      const t2 = scheduled.find((t) => t.id === 't2')!;
      expect(t2.startDate).toBe('2026-10-13');
    });

    it('enforces Finish-to-Finish (FF) dependency', () => {
      const tasks: Task[] = [
        {
          id: 't1',
          name: 'Predecessor',
          startDate: '2026-10-11',
          duration: 4, // Ends Wed 2026-10-14
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
        {
          id: 't2',
          name: 'Successor',
          startDate: '2026-10-11',
          duration: 2,
          progress: 0,
          priority: 'Normal',
          milestone: false,
          summary: false,
          parentId: null,
        },
      ];
      const deps: Dependency[] = [
        {
          id: 'd1',
          predecessorId: 't1',
          successorId: 't2',
          type: 'FF',
          hardness: 'Strong',
          delay: 0,
        },
      ];

      const scheduled = autoScheduleTasks(tasks, deps, baseProject);
      const t2 = scheduled.find((t) => t.id === 't2')!;
      // If t2 finishes on 2026-10-14 and duration is 2, it must start on 2026-10-13 (Tue)
      expect(t2.startDate).toBe('2026-10-13');
    });
  });

  describe('wouldCreateCycle - Directed Graph Cycle Detection', () => {
    it('detects self-loop', () => {
      expect(wouldCreateCycle('t1', 't1', [])).toBe(true);
    });

    it('detects 2-node cycle', () => {
      const deps: Dependency[] = [
        { id: 'd1', predecessorId: 't1', successorId: 't2', type: 'FS', hardness: 'Strong', delay: 0 },
      ];
      // Adding t2 -> t1 closes loop
      expect(wouldCreateCycle('t2', 't1', deps)).toBe(true);
      // Adding t1 -> t3 is valid DAG
      expect(wouldCreateCycle('t1', 't3', deps)).toBe(false);
    });

    it('detects multi-node transitive cycle', () => {
      const deps: Dependency[] = [
        { id: 'd1', predecessorId: 'a', successorId: 'b', type: 'FS', hardness: 'Strong', delay: 0 },
        { id: 'd2', predecessorId: 'b', successorId: 'c', type: 'FS', hardness: 'Strong', delay: 0 },
        { id: 'd3', predecessorId: 'c', successorId: 'd', type: 'FS', hardness: 'Strong', delay: 0 },
      ];
      // d -> a creates cycle: a -> b -> c -> d -> a
      expect(wouldCreateCycle('d', 'a', deps)).toBe(true);
      // b -> d does not create cycle
      expect(wouldCreateCycle('b', 'd', deps)).toBe(false);
    });
  });
});
