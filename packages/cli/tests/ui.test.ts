import { describe, expect, it } from 'vitest';
import { drawBadge, drawBox, tokenBar } from '../src/ui/box.js';
import { c, isTTY } from '../src/ui/colors.js';

describe('drawBox', () => {
  it('returns box with title and content', () => {
    const box = drawBox('TEST', 'hello', (s: string) => s);
    expect(box).toContain('TEST');
    expect(box).toContain('hello');
    expect(box).toContain('┌');
    expect(box).toContain('└');
    expect(box).toContain('│');
  });

  it('handles multi-line content', () => {
    const box = drawBox('HEADER', '{\n  "alg": "HS256"\n}', (s: string) => s);
    expect(box).toContain('HEADER');
    expect(box).toContain('"alg"');
  });

  it('handles empty content', () => {
    const box = drawBox('EMPTY', '', (s: string) => s);
    expect(box).toContain('EMPTY');
    expect(box).toContain('┌');
  });

  it('applies color function to borders', () => {
    let colored = false;
    const box = drawBox('T', 'x', (s: string) => {
      colored = true;
      return `[${s}]`;
    });
    expect(colored).toBe(true);
    expect(box).toContain('[');
  });
});

describe('drawBadge', () => {
  it('returns double-line badge with icon', () => {
    const badge = drawBadge('VERIFIED', (s: string) => s, '✓');
    expect(badge).toContain('VERIFIED');
    expect(badge).toContain('✓');
    expect(badge).toContain('╔');
    expect(badge).toContain('║');
    expect(badge).toContain('╚');
  });

  it('applies color function', () => {
    const badge = drawBadge('FAIL', (s: string) => `RED:${s}`, '✗');
    expect(badge).toContain('RED:');
  });
});

describe('tokenBar', () => {
  it('returns proportional bar with dots', () => {
    const bar = tokenBar('short', 'mediummedium', 'long');
    expect(bar).toContain('█');
    expect(bar).toContain('.');
  });

  it('handles equal-length parts', () => {
    const bar = tokenBar('aaa', 'bbb', 'ccc');
    expect(bar).toContain('█');
  });

  it('handles very short parts', () => {
    const bar = tokenBar('a', 'b', 'c');
    expect(bar).toContain('█');
  });

  it('handles very long parts', () => {
    const bar = tokenBar('a'.repeat(100), 'b'.repeat(200), 'c'.repeat(50));
    expect(bar).toContain('█');
  });
});

describe('colors', () => {
  it('isTTY returns a boolean', () => {
    expect(typeof isTTY()).toBe('boolean');
  });

  it('all color functions return strings', () => {
    const fns = [c.red, c.green, c.yellow, c.blue, c.cyan, c.magenta, c.gray, c.bold, c.dim];
    for (const fn of fns) {
      expect(typeof fn('test')).toBe('string');
      expect(fn('test').length).toBeGreaterThan(0);
    }
  });

  it('color functions handle empty strings', () => {
    expect(typeof c.red('')).toBe('string');
  });

  it('color functions handle special characters', () => {
    expect(typeof c.red('✓ ✗ █')).toBe('string');
  });
});
