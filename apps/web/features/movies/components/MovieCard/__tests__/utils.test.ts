import { describe, it, expect } from 'vitest';
import { formatDuration } from '../utils';

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(128)).toBe('2h 08m');
  });

  it('formats exactly 60 minutes', () => {
    expect(formatDuration(60)).toBe('1h 00m');
  });

  it('formats under one hour', () => {
    expect(formatDuration(45)).toBe('0h 45m');
  });

  it('formats 100 minutes', () => {
    expect(formatDuration(100)).toBe('1h 40m');
  });
});
