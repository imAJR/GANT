import { describe, it, expect } from 'vitest';
import {
  isValidDateString,
  alignToWorkingDay,
  calculateEndDate,
  calculateStartDateForEndDate,
  calculateWorkingDaysBetween,
  diffCalendarDays,
  addCalendarDays,
  addWorkingDays,
  getNextWorkingDay,
  sanitizeWeekendDays,
} from './calendar';

describe('Calendar Engine & Working Day Arithmetic', () => {
  describe('isValidDateString', () => {
    it('accepts valid calendar dates', () => {
      expect(isValidDateString('2026-10-11')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // 2024 is leap year
      expect(isValidDateString('2026-12-31')).toBe(true);
      expect(isValidDateString('1999-01-01')).toBe(true);
    });

    it('rejects invalid or impossible calendar dates', () => {
      expect(isValidDateString('2025-02-29')).toBe(false); // 2025 non-leap
      expect(isValidDateString('2026-04-31')).toBe(false); // April has 30 days
      expect(isValidDateString('2026-00-10')).toBe(false); // Month 0
      expect(isValidDateString('2026-13-10')).toBe(false); // Month 13
      expect(isValidDateString('2026-10-00')).toBe(false); // Day 0
      expect(isValidDateString('2026-10-32')).toBe(false); // Day 32
      expect(isValidDateString('not-a-date')).toBe(false);
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null)).toBe(false);
      expect(isValidDateString(undefined)).toBe(false);
      expect(isValidDateString(12345)).toBe(false);
    });
  });

  describe('sanitizeWeekendDays', () => {
    it('handles valid weekend arrays', () => {
      expect(sanitizeWeekendDays([5, 6])).toEqual([5, 6]);
      expect(sanitizeWeekendDays([0, 6])).toEqual([0, 6]);
    });

    it('falls back to [5, 6] for invalid inputs or when all days are weekends', () => {
      expect(sanitizeWeekendDays([])).toEqual([5, 6]);
      expect(sanitizeWeekendDays(undefined)).toEqual([5, 6]);
      expect(sanitizeWeekendDays([0, 1, 2, 3, 4, 5, 6])).toEqual([5, 6]); // 7 days would freeze loops
    });
  });

  describe('alignToWorkingDay', () => {
    it('leaves working days unchanged', () => {
      // 2026-10-11 is Sunday (day 0). With weekend [5, 6], Sunday is a workday.
      expect(alignToWorkingDay('2026-10-11', [5, 6])).toBe('2026-10-11');
    });

    it('advances weekend days to the next working day', () => {
      // 2026-10-16 is Friday (day 5) -> weekend. Next working day is Sunday 2026-10-18.
      expect(alignToWorkingDay('2026-10-16', [5, 6])).toBe('2026-10-18');
      // 2026-10-17 is Saturday (day 6) -> weekend. Next working day is Sunday 2026-10-18.
      expect(alignToWorkingDay('2026-10-17', [5, 6])).toBe('2026-10-18');
    });
  });

  describe('calculateEndDate and calculateStartDateForEndDate', () => {
    it('calculates duration 1 as ending on same date if starting on working day', () => {
      expect(calculateEndDate('2026-10-11', 1, [5, 6])).toBe('2026-10-11');
    });

    it('calculates milestone duration 0 as ending on same date', () => {
      expect(calculateEndDate('2026-10-11', 0, [5, 6])).toBe('2026-10-11');
    });

    it('skips weekend days across multiple working days', () => {
      // Starts Wednesday 2026-10-14, duration 4 days:
      // Day 1: Wed Oct 14
      // Day 2: Thu Oct 15
      // Fri Oct 16 (weekend)
      // Sat Oct 17 (weekend)
      // Day 3: Sun Oct 18
      // Day 4: Mon Oct 19
      expect(calculateEndDate('2026-10-14', 4, [5, 6])).toBe('2026-10-19');
    });

    it('is invertible with calculateStartDateForEndDate', () => {
      const start = '2026-10-14';
      const duration = 5;
      const weekend = [5, 6];
      const end = calculateEndDate(start, duration, weekend);
      const computedStart = calculateStartDateForEndDate(end, duration, weekend);
      expect(computedStart).toBe(start);
    });
  });

  describe('addWorkingDays and getNextWorkingDay', () => {
    it('advances by N working days correctly', () => {
      // Thursday 2026-10-15 + 1 working day should be Sunday 2026-10-18
      expect(addWorkingDays('2026-10-15', 1, [5, 6])).toBe('2026-10-18');
      // Thursday 2026-10-15 + 2 working days should be Monday 2026-10-19
      expect(addWorkingDays('2026-10-15', 2, [5, 6])).toBe('2026-10-19');
      expect(getNextWorkingDay('2026-10-15', [5, 6])).toBe('2026-10-18');
    });
  });

  describe('calculateWorkingDaysBetween and diffCalendarDays', () => {
    it('counts working days correctly', () => {
      // From 2026-10-14 (Wed) to 2026-10-19 (Mon) inclusive:
      // Wed, Thu, Sun, Mon = 4 working days
      expect(calculateWorkingDaysBetween('2026-10-14', '2026-10-19', [5, 6])).toBe(4);
    });

    it('calculates calendar days correctly', () => {
      expect(diffCalendarDays('2026-10-11', '2026-10-16')).toBe(5);
      expect(addCalendarDays('2026-10-11', 5)).toBe('2026-10-16');
    });
  });
});
