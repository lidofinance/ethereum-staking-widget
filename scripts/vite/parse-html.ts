import { parse, type HTMLElement } from 'node-html-parser';

/**
 * The one way build plugins read or edit HTML — a real parser instead of
 * regex/string surgery over markup, so a match can never land inside
 * script content, JSON data elements, or comments, and injections are
 * positional (a real <head>) rather than "first occurrence of a
 * substring". node-html-parser is deliberately the same parser
 * vite-prerender-plugin uses to WRITE these files, and it serializes
 * minimally — bytes it didn't touch stay byte-identical, which matters
 * because CSP hashes are computed from these same files afterwards.
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
