/**
 * GANT — Project Scheduling & Dependency Engine
 * Computes hierarchy tree, summary task dates, working day end dates,
 * and dependency cascades.
 */

import { Task, ComputedTask, Dependency, ProjectMetadata } from '../types/project';
import {
  alignToWorkingDay,
  calculateEndDate,
  calculateStartDateForEndDate,
  calculateWorkingDaysBetween,
  addWorkingDays,
  parseLocalDate,
  toDateString,
} from './calendar';

/**
 * Builds computed task list with resolved end dates, hierarchy levels, and summary task intervals.
 */
export function computeProjectSchedule(
  tasks: Task[],
  dependencies: Dependency[],
  project: ProjectMetadata
): ComputedTask[] {
  const weekendDays = project.weekendDays;

  // Step 1: Map child relationships
  const childrenMap = new Map<string, string[]>();
  tasks.forEach((t) => {
    if (t.parentId) {
      const arr = childrenMap.get(t.parentId) || [];
      arr.push(t.id);
      childrenMap.set(t.parentId, arr);
    }
  });

  // Step 2: Compute hierarchy depth (level)
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  const getLevel = (taskId: string, visited = new Set<string>()): number => {
    if (visited.has(taskId)) return 0;
    visited.add(taskId);
    const t = taskMap.get(taskId);
    if (!t || !t.parentId) return 0;
    return 1 + getLevel(t.parentId, visited);
  };

  // Step 3: Compute leaf tasks first (calculate working day end dates)
  const intermediateMap = new Map<string, ComputedTask>();

  tasks.forEach((t) => {
    const children = childrenMap.get(t.id) || [];
    const isSummary = children.length > 0 || !!t.summary;
    const alignedStart = alignToWorkingDay(t.startDate || project.startDate, weekendDays);
    const dur = t.milestone ? 0 : Math.max(0, t.duration ?? 1);
    const computedEnd = calculateEndDate(alignedStart, dur, weekendDays);

    intermediateMap.set(t.id, {
      ...t,
      startDate: alignedStart,
      duration: dur,
      endDate: computedEnd,
      summary: isSummary,
      level: getLevel(t.id),
      hasChildren: children.length > 0,
      childrenIds: children,
    });
  });

  // Step 4: Propagate summary task ranges from children upwards
  // Process bottom-up by level
  const sortedByLevelDesc = [...intermediateMap.values()].sort((a, b) => b.level - a.level);

  sortedByLevelDesc.forEach((computedTask) => {
    if (computedTask.hasChildren) {
      const children = computedTask.childrenIds
        .map((cid) => intermediateMap.get(cid))
        .filter((c): c is ComputedTask => c !== undefined);

      if (children.length > 0) {
        // Earliest child start date
        let earliestStart = children[0].startDate;
        let latestEnd = children[0].endDate;

        children.forEach((c) => {
          if (c.startDate < earliestStart) earliestStart = c.startDate;
          if (c.endDate > latestEnd) latestEnd = c.endDate;
        });

        const computedDur = calculateWorkingDaysBetween(earliestStart, latestEnd, weekendDays);

        computedTask.startDate = earliestStart;
        computedTask.endDate = latestEnd;
        computedTask.duration = Math.max(1, computedDur);
        computedTask.summary = true;
      }
    }
  });

  // Return tasks in original order with updated computed data
  return tasks.map((t) => intermediateMap.get(t.id)!);
}

/**
 * Auto-schedules tasks by enforcing dependencies topologically.
 * For example, if predecessor B finishes on 2026-10-14 and A has an FS dependency on B,
 * A's start date is shifted to next working day after 2026-10-14 + delay.
 */
export function autoScheduleTasks(
  tasks: Task[],
  dependencies: Dependency[],
  project: ProjectMetadata
): Task[] {
  const weekendDays = project.weekendDays;
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, { ...t }));

  // Build dependency graph
  const predecessorsOf = new Map<string, Dependency[]>();
  dependencies.forEach((dep) => {
    const list = predecessorsOf.get(dep.successorId) || [];
    list.push(dep);
    predecessorsOf.set(dep.successorId, list);
  });

  // Iteratively adjust successor dates (max iterations to avoid infinite cycles)
  let changed = true;
  let iterations = 0;
  const maxIterations = tasks.length * 4;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Compute current state
    const computed = computeProjectSchedule(Array.from(taskMap.values()), dependencies, project);
    const computedMap = new Map<string, ComputedTask>();
    computed.forEach((c) => computedMap.set(c.id, c));

    for (const dep of dependencies) {
      const pred = computedMap.get(dep.predecessorId);
      const succ = taskMap.get(dep.successorId);

      if (!pred || !succ || succ.summary) continue;

      if (dep.type === 'FS') {
        // Finish to Start: Succ must start on or after pred's end date + 1 day + delay (working days)
        const earliestPossible = addWorkingDays(
          pred.endDate,
          1 + Math.max(0, dep.delay || 0),
          weekendDays
        );

        if (succ.startDate < earliestPossible) {
          succ.startDate = earliestPossible;
          changed = true;
        }
      } else if (dep.type === 'SS') {
        // Start to Start: Succ must start on or after pred's start date + delay (working days)
        const earliestPossible = addWorkingDays(
          pred.startDate,
          Math.max(0, dep.delay || 0),
          weekendDays
        );

        if (succ.startDate < earliestPossible) {
          succ.startDate = earliestPossible;
          changed = true;
        }
      } else if (dep.type === 'FF') {
        // Finish to Finish: Succ must finish on or after pred's end date + delay
        const requiredEnd = addWorkingDays(
          pred.endDate,
          Math.max(0, dep.delay || 0),
          weekendDays
        );

        const succComputed = computedMap.get(dep.successorId);
        if (succComputed && succComputed.endDate < requiredEnd) {
          const neededStart = calculateStartDateForEndDate(requiredEnd, succ.duration, weekendDays);
          if (succ.startDate < neededStart) {
            succ.startDate = neededStart;
            changed = true;
          }
        }
      } else if (dep.type === 'SF') {
        // Start to Finish: Succ must finish on or after pred's start date + delay
        const requiredEnd = addWorkingDays(
          pred.startDate,
          Math.max(0, dep.delay || 0),
          weekendDays
        );

        const succComputed = computedMap.get(dep.successorId);
        if (succComputed && succComputed.endDate < requiredEnd) {
          const neededStart = calculateStartDateForEndDate(requiredEnd, succ.duration, weekendDays);
          if (succ.startDate < neededStart) {
            succ.startDate = neededStart;
            changed = true;
          }
        }
      }
    }
  }

  return tasks.map((t) => taskMap.get(t.id)!);
}

/**
 * Check if a proposed dependency would create a cycle in the dependency graph.
 * In a directed graph, adding edge u -> v creates a cycle if and only if
 * there already exists a directed path from v to u (or if u === v).
 */
export function wouldCreateCycle(
  predecessorId: string,
  successorId: string,
  existingDependencies: Dependency[]
): boolean {
  if (!predecessorId || !successorId || predecessorId === successorId) return true;

  // Build adjacency list for existing dependencies
  const adj = new Map<string, string[]>();
  for (const dep of existingDependencies) {
    const list = adj.get(dep.predecessorId) || [];
    list.push(dep.successorId);
    adj.set(dep.predecessorId, list);
  }

  // BFS search starting from successorId to see if predecessorId is reachable
  const queue: string[] = [successorId];
  const visited = new Set<string>([successorId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === predecessorId) {
      return true; // Cycle detected!
    }

    const nextNodes = adj.get(current) || [];
    for (const next of nextNodes) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}
