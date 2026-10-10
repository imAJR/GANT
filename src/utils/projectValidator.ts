/**
 * GANT — Project Import & State Validator
 * Sanitizes and validates imported JSON data according to strict integrity rules:
 * - Real calendar dates (YYYY-MM-DD)
 * - Unique task IDs
 * - Valid parent-child relationships without dangling pointers or self-references
 * - Valid dependency predecessor and successor task references without self-loops
 * - Valid resource and assignment references with non-negative numeric units
 * - Complete fallback defaults for missing optional fields
 */

import {
  ProjectState,
  ProjectMetadata,
  Task,
  Role,
  Resource,
  Assignment,
  Dependency,
  PriorityLevel,
  DependencyType,
  LinkHardness,
} from '../types/project';
import { isValidDateString, alignToWorkingDay, sanitizeWeekendDays } from './calendar';
import { wouldCreateCycle } from './scheduler';
import { INITIAL_PROJECT_METADATA, INITIAL_ROLES } from '../data/initialProject';

export interface ValidationResult {
  isValid: boolean;
  sanitizedState?: ProjectState;
  errors: string[];
}

const VALID_PRIORITIES: PriorityLevel[] = ['Low', 'Normal', 'High', 'Highest'];
const VALID_DEP_TYPES: DependencyType[] = ['FS', 'SS', 'FF', 'SF'];
const VALID_HARDNESS: LinkHardness[] = ['Strong', 'Normal'];

export function sanitizeAndValidateProjectJSON(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { isValid: false, errors: ['ملف JSON غير صالح أو فارغ'] };
  }

  const raw = input as Record<string, unknown>;

  // 1. Validate project metadata
  const rawProject = (raw.project && typeof raw.project === 'object' && !Array.isArray(raw.project) ? raw.project : {}) as Record<string, unknown>;
  const projectName = typeof rawProject.name === 'string' && rawProject.name.trim()
    ? rawProject.name.trim()
    : 'مشروع مستورد بدون عنوان';

  let startDate = typeof rawProject.startDate === 'string' ? rawProject.startDate.trim() : '';
  if (!isValidDateString(startDate)) {
    startDate = INITIAL_PROJECT_METADATA.startDate;
  }

  const weekendDays = sanitizeWeekendDays(rawProject.weekendDays as number[]);

  const sanitizedProject: ProjectMetadata = {
    id: typeof rawProject.id === 'string' && rawProject.id ? rawProject.id : `proj_${Date.now()}`,
    name: projectName,
    organization: typeof rawProject.organization === 'string' ? rawProject.organization : INITIAL_PROJECT_METADATA.organization,
    description: typeof rawProject.description === 'string' ? rawProject.description : '',
    webLink: typeof rawProject.webLink === 'string' ? rawProject.webLink : '',
    startDate,
    weekendDays,
    designer: typeof rawProject.designer === 'string' ? rawProject.designer : INITIAL_PROJECT_METADATA.designer,
    year: typeof rawProject.year === 'number' ? rawProject.year : 2026,
  };

  // 2. Validate tasks array
  if (!Array.isArray(raw.tasks)) {
    return { isValid: false, errors: ['يجب أن يحتوي ملف المشروع على مصفوفة مهام صالحة (tasks)'] };
  }

  const rawTasks = raw.tasks as unknown[];
  const taskIdsSet = new Set<string>();
  const sanitizedTasks: Task[] = [];

  rawTasks.forEach((rt, idx) => {
    if (!rt || typeof rt !== 'object' || Array.isArray(rt)) return;
    const item = rt as Record<string, unknown>;

    let taskId = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `task_${idx + 1}`;
    // Deduplicate IDs
    if (taskIdsSet.has(taskId)) {
      const baseId = taskId;
      let counter = 1;
      while (taskIdsSet.has(taskId)) {
        taskId = `${baseId}_dup_${counter++}`;
      }
    }
    taskIdsSet.add(taskId);

    const taskName = typeof item.name === 'string' && item.name.trim()
      ? item.name.trim()
      : `مهمة ${idx + 1}`;

    let taskStartDate = typeof item.startDate === 'string' && isValidDateString(item.startDate.trim())
      ? item.startDate.trim()
      : startDate;

    taskStartDate = alignToWorkingDay(taskStartDate, weekendDays);

    const rawDur = typeof item.duration === 'number' ? item.duration : Number(item.duration);
    const isMilestone = Boolean(item.milestone);
    const duration = isMilestone ? 0 : isNaN(rawDur) || rawDur < 0 ? 1 : Math.round(rawDur);

    const priority: PriorityLevel = typeof item.priority === 'string' && VALID_PRIORITIES.includes(item.priority as PriorityLevel)
      ? (item.priority as PriorityLevel)
      : 'Normal';

    const rawProg = typeof item.progress === 'number' ? item.progress : Number(item.progress);
    const progress = isNaN(rawProg) ? 0 : Math.max(0, Math.min(100, Math.round(rawProg)));

    sanitizedTasks.push({
      id: taskId,
      name: taskName,
      parentId: typeof item.parentId === 'string' && item.parentId.trim() ? item.parentId.trim() : null,
      startDate: taskStartDate,
      duration,
      priority,
      progress,
      milestone: isMilestone,
      summary: Boolean(item.summary),
      color: typeof item.color === 'string' ? item.color : undefined,
      notes: typeof item.notes === 'string' ? item.notes : '',
      deadline: typeof item.deadline === 'string' && isValidDateString(item.deadline.trim()) ? item.deadline.trim() : null,
    });
  });

  // Clean parentId pointers: parentId must point to an existing other task
  sanitizedTasks.forEach((t) => {
    if (t.parentId) {
      if (!taskIdsSet.has(t.parentId) || t.parentId === t.id) {
        t.parentId = null;
      }
    }
  });

  // Prevent cyclical parent references (e.g., A -> B -> A)
  sanitizedTasks.forEach((t) => {
    let curr = t.parentId;
    const visited = new Set<string>([t.id]);
    while (curr) {
      if (visited.has(curr)) {
        t.parentId = null; // Break cycle
        break;
      }
      visited.add(curr);
      const parentTask = sanitizedTasks.find((p) => p.id === curr);
      curr = parentTask?.parentId || null;
    }
  });

  // 3. Validate Roles
  const sanitizedRoles: Role[] = [];
  const roleIdsSet = new Set<string>();

  if (Array.isArray(raw.roles)) {
    raw.roles.forEach((rr, idx) => {
      if (!rr || typeof rr !== 'object') return;
      const r = rr as Record<string, unknown>;
      let rId = typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `role_${idx + 1}`;
      if (roleIdsSet.has(rId)) rId = `${rId}_${idx}`;
      roleIdsSet.add(rId);

      sanitizedRoles.push({
        id: rId,
        name: typeof r.name === 'string' && r.name.trim() ? r.name.trim() : `دور ${idx + 1}`,
      });
    });
  }

  if (sanitizedRoles.length === 0) {
    INITIAL_ROLES.forEach((r) => {
      sanitizedRoles.push({ ...r });
      roleIdsSet.add(r.id);
    });
  }

  // 4. Validate Resources
  const sanitizedResources: Resource[] = [];
  const resourceIdsSet = new Set<string>();

  if (Array.isArray(raw.resources)) {
    raw.resources.forEach((rr, idx) => {
      if (!rr || typeof rr !== 'object') return;
      const res = rr as Record<string, unknown>;
      let resId = typeof res.id === 'string' && res.id.trim() ? res.id.trim() : `res_${idx + 1}`;
      if (resourceIdsSet.has(resId)) resId = `${resId}_${idx}`;
      resourceIdsSet.add(resId);

      const rRole = typeof res.roleId === 'string' && roleIdsSet.has(res.roleId)
        ? res.roleId
        : sanitizedRoles[0].id;

      sanitizedResources.push({
        id: resId,
        name: typeof res.name === 'string' && res.name.trim() ? res.name.trim() : `مورد ${idx + 1}`,
        roleId: rRole,
      });
    });
  }

  // 5. Validate Assignments
  const sanitizedAssignments: Assignment[] = [];
  const assignmentPairsSet = new Set<string>();

  if (Array.isArray(raw.assignments)) {
    raw.assignments.forEach((ra, idx) => {
      if (!ra || typeof ra !== 'object') return;
      const asg = ra as Record<string, unknown>;
      const taskId = typeof asg.taskId === 'string' ? asg.taskId.trim() : '';
      const resourceId = typeof asg.resourceId === 'string' ? asg.resourceId.trim() : '';

      if (!taskIdsSet.has(taskId) || !resourceIdsSet.has(resourceId)) {
        return; // Skip invalid references
      }

      const pairKey = `${taskId}_${resourceId}`;
      if (assignmentPairsSet.has(pairKey)) {
        return; // Skip duplicate assignments of same resource to same task
      }
      assignmentPairsSet.add(pairKey);

      const rawUnit = typeof asg.unit === 'number' ? asg.unit : Number(asg.unit);
      const unit = isNaN(rawUnit) || rawUnit <= 0 ? 100.0 : Math.round(rawUnit * 10) / 10;

      sanitizedAssignments.push({
        id: typeof asg.id === 'string' && asg.id ? asg.id : `asgn_${idx + 1}`,
        taskId,
        resourceId,
        unit,
      });
    });
  }

  // 6. Validate Dependencies
  const sanitizedDependencies: Dependency[] = [];
  const dependencyPairsSet = new Set<string>();

  if (Array.isArray(raw.dependencies)) {
    raw.dependencies.forEach((rd, idx) => {
      if (!rd || typeof rd !== 'object') return;
      const dep = rd as Record<string, unknown>;
      const predId = typeof dep.predecessorId === 'string' ? dep.predecessorId.trim() : '';
      const succId = typeof dep.successorId === 'string' ? dep.successorId.trim() : '';

      // Must be valid existing tasks and cannot link task to itself
      if (!taskIdsSet.has(predId) || !taskIdsSet.has(succId) || predId === succId) {
        return;
      }

      const pairKey = `${predId}_${succId}`;
      if (dependencyPairsSet.has(pairKey)) {
        return; // Skip duplicate dependency
      }

      // Check for cycles before adding
      if (wouldCreateCycle(predId, succId, sanitizedDependencies)) {
        errors.push(`تم استبعاد التبعية الدائرية بين ${predId} و ${succId}`);
        return;
      }
      dependencyPairsSet.add(pairKey);

      const type: DependencyType = typeof dep.type === 'string' && VALID_DEP_TYPES.includes(dep.type as DependencyType)
        ? (dep.type as DependencyType)
        : 'FS';

      const hardness: LinkHardness = typeof dep.hardness === 'string' && VALID_HARDNESS.includes(dep.hardness as LinkHardness)
        ? (dep.hardness as LinkHardness)
        : 'Strong';

      const rawDelay = typeof dep.delay === 'number' ? dep.delay : Number(dep.delay);
      const delay = isNaN(rawDelay) ? 0 : Math.max(0, Math.round(rawDelay));

      sanitizedDependencies.push({
        id: typeof dep.id === 'string' && dep.id ? dep.id : `dep_${idx + 1}`,
        predecessorId: predId,
        successorId: succId,
        type,
        hardness,
        delay,
      });
    });
  }

  return {
    isValid: true,
    sanitizedState: {
      project: sanitizedProject,
      tasks: sanitizedTasks,
      roles: sanitizedRoles,
      resources: sanitizedResources,
      assignments: sanitizedAssignments,
      dependencies: sanitizedDependencies,
    },
    errors,
  };
}
