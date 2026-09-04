import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { themeDark, themeDefault, themeLight } from '@lidofinance/lido-ui';

/**
 * Drift guard for styles/lido-ui-tokens.css: the bridged custom properties
 * must stay byte-equal to the installed lido-ui theme, and the assumption
 * that non-color tokens don't branch per theme must keep holding. A lido-ui
 * bump that changes either fails here instead of skewing migrated CSS.
 */

const css = readFileSync(
  fileURLToPath(new URL('lido-ui-tokens.css', import.meta.url)),
  'utf-8',
);

const parseCssVars = (source: string): Record<string, string> => {
  const vars: Record<string, string> = {};
  for (const [, name, value] of source.matchAll(
    /(--lido-[\w-]+)\s*:\s*([^;]+);/g,
  )) {
    vars[name] = value.trim();
  }
  return vars;
};

const px = (value: number) => `${value}px`;

const expectedVars: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(themeDefault.spaceMap).map(([key, value]) => [
      `--lido-space-${key}`,
      px(value),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(themeDefault.fontSizesMap).map(([key, value]) => [
      `--lido-font-size-${key}`,
      px(value),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(themeDefault.borderRadiusesMap).map(([key, value]) => [
      `--lido-border-radius-${key}`,
      px(value),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(themeDefault.duration).map(([key, value]) => [
      `--lido-duration-${key}`,
      value,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(themeDefault.boxShadows).map(([key, value]) => [
      `--lido-box-shadow-${key}`,
      value,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(themeDefault.ease).map(([key, value]) => [
      `--lido-ease-${key}`,
      value,
    ]),
  ),
};

describe('lido-ui-tokens.css', () => {
  it('matches the installed lido-ui theme exactly (no missing/extra/stale vars)', () => {
    expect(parseCssVars(css)).toEqual(expectedVars);
  });

  it('bridged tokens are theme-independent (only colors/name differ)', () => {
    const nonColor = ({ colors: _c, name: _n, ...rest }: typeof themeLight) =>
      rest;
    expect(nonColor(themeLight)).toEqual(nonColor(themeDark));
  });

  it('breakpoints match the media queries hardcoded in migrated CSS', () => {
    // CSS custom properties can't hold media queries, so migrated
    // *.module.css files write them out; this pins the values they assume.
    expect(themeDefault.mediaQueries).toEqual({
      sm: '@media screen and (max-width: 359px)',
      md: '@media screen and (max-width: 479px)',
      lg: '@media screen and (max-width: 767px)',
      xl: '@media screen and (max-width: 1023px)',
    });
  });
});
