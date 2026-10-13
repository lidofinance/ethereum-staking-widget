/**
 * Runtime tripwire for the remaining Next.js compatibility shims
 * (next/router, next/link, next/head).
 *
 * App code must not import `next/*` — the ESLint `no-restricted-syntax`
 * warning catches that statically. The shims exist only for node_modules
 * dependencies (e.g. `next/link.js` inside @lidofinance/lido-ui) and
 * not-yet-ported code arriving via upstream merges. Whenever a shim is
 * actually exercised at runtime, this guard prints one loud console
 * warning per shim, with the call stack of the first usage, so the
 * importer can be identified and ported (or accepted as a known
 * dependency-side usage).
 */

const warned = new Set<string>();

const BADGE_CSS =
  'font-size:14px;font-weight:700;color:#fff;background:#d22d2d;' +
  'padding:6px 10px;border-radius:6px;';

export const warnShimUsage = (shim: string): void => {
  if (warned.has(shim)) return;
  warned.add(shim);

  // Stack of the first usage — enough to identify the importer. Drop the
  // first two frames (Error construction + this guard).
  const stack = new Error(`shim usage: ${shim}`).stack
    ?.split('\n')
    .slice(2)
    .join('\n');

  const message = [
    `A Next.js compatibility shim was exercised at runtime: "${shim}".`,
    '',
    'App code must not depend on next/* — import react-router /',
    'react-helmet-async directly. Shims exist only for node_modules',
    'dependencies. Trace the stack below to the importer and port it.',
    '',
    stack ?? '(no stack available)',
  ].join('\n');

  // %c styling renders as a big red badge in browser devtools and is
  // ignored gracefully (printed raw) in Node/vitest output.
  console.warn(`%c⚠ NEXT.JS SHIM USED: ${shim}`, BADGE_CSS, '\n' + message);
};
