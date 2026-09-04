import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { themeDark, themeDefault, themeLight } from '@lidofinance/lido-ui';

import { NAV_MOBILE_MAX_WIDTH } from './constants';

/**
 * Drift guard for the lido-ui token bridge (styles/lido-ui-tokens.css and
 * styles/lido-ui-media.css): the bridged custom properties and @custom-media
 * breakpoints must stay byte-equal to the installed lido-ui theme, and the
 * assumption that non-color tokens don't branch per theme must keep holding.
 * A lido-ui bump that changes either fails here instead of skewing migrated
 * CSS.
 */

const readStyles = (file: string) =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf-8');

const css = readStyles('lido-ui-tokens.css');
const mediaCss = readStyles('lido-ui-media.css');

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

  it('@custom-media breakpoints match lido-ui and app constants', () => {
    const customMedia: Record<string, string> = {};
    for (const [, name, query] of mediaCss.matchAll(
      /@custom-media\s+(--[\w-]+)\s+([^;]+);/g,
    )) {
      customMedia[name] = query.trim();
    }

    expect(customMedia).toEqual({
      ...Object.fromEntries(
        Object.entries(themeDefault.mediaQueries).map(([key, value]) => [
          `--lido-media-${key}`,
          value.replace(/^@media\s+/, ''),
        ]),
      ),
      '--custom-media-nav-mobile': `screen and (max-width: ${NAV_MOBILE_MAX_WIDTH}px)`,
    });
  });
});
