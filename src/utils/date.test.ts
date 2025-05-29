import { describe, test, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
  test('should format a valid date string', () => {
    expect(formatDate('2023-10-26T10:00:00.000Z')).toBe('Kamis, 26 Oktober 2023');
  });
  test('should return "Unknown" for undefined input', () => {
    expect(formatDate(undefined)).toBe('Unknown');
  });
});
