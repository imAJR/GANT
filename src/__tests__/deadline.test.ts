
import { describe, it, expect } from 'vitest';
import { sanitizeAndValidateProjectJSON } from '../utils/projectValidator';

describe('Deadline Persistence', () => {
  it('should sanitize and validate a project with a valid deadline', () => {
    const project: any = {
      project: { name: 'Test' },
      tasks: [{ id: 't1', name: 'Task 1', deadline: '2026-12-31' }],
    };
    const result = sanitizeAndValidateProjectJSON(project);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedState?.tasks[0].deadline).toBe('2026-12-31');
  });

  it('should handle missing deadline by setting it to null', () => {
    const project: any = {
      project: { name: 'Test' },
      tasks: [{ id: 't1', name: 'Task 1' }],
    };
    const result = sanitizeAndValidateProjectJSON(project);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedState?.tasks[0].deadline).toBeNull();
  });
});
