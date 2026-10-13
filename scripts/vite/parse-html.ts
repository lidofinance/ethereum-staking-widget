import { parse, type HTMLElement } from 'node-html-parser';

/**
 * HTML parser for editing the vite build output
 *
 * The options are load-bearing:
 *  - `comment: true` — without it comments are DROPPED on re-serialize,
 *    which would delete the window-env SSI include and doc comments;
 *  - `blockTextElements` — keeps script/style content as raw text
 *    (no entity handling), so `.innerHTML` of e.g. the import map returns
 *    the exact bytes the browser will hash.
 */
export const parseHtml = (html: string): HTMLElement =>
  parse(html, {
    comment: true,
    blockTextElements: { script: true, style: true, noscript: true, pre: true },
  });

/** The parsed document's <head>, or a loud failure — injections must
 * never silently no-op. */
export const requireHead = (doc: HTMLElement, context: string): HTMLElement => {
  const head = doc.querySelector('head');
  if (!head) {
    throw new Error(`${context}: no <head> element in the HTML`);
  }
  return head;
};
