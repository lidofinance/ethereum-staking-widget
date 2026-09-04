/**
 * Seam for the styled-components exit (CSS-modules migration).
 *
 * App-code imports of 'styled-components' are rewritten to this module by
 * `scripts/vite/styled-components-seam-plugin.ts`; node_modules consumers
 * (@lidofinance/lido-ui, @reef-knot/*) keep resolving to the real package.
 *
 * Today this is a pure pass-through and MUST stay one instance-wise: lido-ui's
 * CookieThemeProvider provides theme through styled-components' own context,
 * so re-exporting anything but the real module would silently split the theme
 * between app styles and lido-ui styles.
 *
 * What the seam buys:
 * - upstream merges keep compiling untouched — any file that imports
 *   'styled-components' works forever, migrated or not;
 * - one place to instrument or restrict the API during the migration
 *   (e.g. dev-time warnings for patterns the CSS-modules target can't hold).
 *
 * New code should not add styled-components usage — write a
 * `styles.module.css` + `styledElement` (styles/styled-element.tsx) instead.
 * Conversion guide: .claude/skills/css-modules-migration/SKILL.md
 */
export * from 'styled-components';
export { default } from 'styled-components';
