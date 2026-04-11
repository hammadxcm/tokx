import { describe, expect, it } from 'vitest';
import { drawBadge, drawBox, tokenBar } from '../src/ui/box.js';
import { c, isTTY } from '../src/ui/colors.js';

describe('box utilities', () => {
  it('drawBox returns box with title and content', () => {
    const box = drawBox('TEST', 'hello', (s: string) => s);
    expect(box).toContain('TEST');
    expect(box).toContain('hello');
    expect(box).toContain('┌');
    expect(box).toContain('└');
    expect(box).toContain('│');
  });

  it('drawBadge returns double-line badge', () => {
    const badge = drawBadge('VERIFIED', (s: string) => s, '✓');
    expect(badge).toContain('VERIFIED');
    expect(badge).toContain('✓');
    expect(badge).toContain('╔');
    expect(badge).toContain('╚');
  });

  it('tokenBar returns proportional bar', () => {
    const bar = tokenBar('short', 'mediummedium', 'long');
    expect(bar).toContain('█');
  });

  it('tokenBar handles equal-length parts', () => {
    const bar = tokenBar('aaa', 'bbb', 'ccc');
    expect(bar).toContain('█');
  });
});

describe('colors', () => {
  it('isTTY returns a boolean', () => {
    expect(typeof isTTY()).toBe('boolean');
  });

  it('color functions return strings', () => {
    expect(typeof c.red('test')).toBe('string');
    expect(typeof c.green('test')).toBe('string');
    expect(typeof c.bold('test')).toBe('string');
    expect(typeof c.dim('test')).toBe('string');
  });
});
