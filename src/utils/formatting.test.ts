import { describe, test, expect } from 'vitest';
import { formatNumber } from './formatting';

describe('formatNumber', () => {
  test('should format a number with thousands separator', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });
  test('should return empty string for null/undefined', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
  });
});
