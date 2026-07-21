import { pageMeta, ROUTE_META, type MetaTag } from '../shared/seo';

/**
 * Head-only prerender entry for `vite-prerender-plugin`.
 *
 * Returns empty `html`, so the body stays the SPA bootstrap
 * (`<div id="root">`): nothing is server-rendered, the client mounts via
 * `createRoot` (not `hydrateRoot`), so there is no hydration to mismatch.
 * Only the `<head>` is populated per route. Full-body prerender was tried
 * and rejected empirically — this non-deterministic SPA (theme-from-cookie,
 * breakpoints, wallet state) produces app-wide hydration mismatches; see
 * simple-staking-widget/docs/migration/framework-mode-experiment.md.
 *
 * This module imports nothing from the app — only the pure `shared/seo.ts`
 * data — so the build never loads wallet SDKs or touches `window`.
 */

interface PrerenderData {
  url: string;
}

interface HeadElement {
  type: string;
  props: Record<string, string>;
}

interface PrerenderResult {
  html: string;
  links: Set<string>;
  head: {
    lang: string;
    title?: string;
    elements: Set<HeadElement>;
  };
}

const ROUTES = Object.keys(ROUTE_META);

const normalizePath = (url: string): string => {
  const path = url.startsWith('http')
    ? new URL(url).pathname
    : url.split('?')[0];
  const trimmed = path.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

const toHeadElements = (tags: MetaTag[]): Set<HeadElement> => {
  const elements = new Set<HeadElement>();
  for (const tag of tags) {
    if ('title' in tag) continue; // title is set via head.title, not an element
    if ('rel' in tag) {
      elements.add({ type: 'link', props: { rel: tag.rel, href: tag.href } });
      continue;
    }
    elements.add({
      type: 'meta',
      props:
        'name' in tag
          ? { name: tag.name, content: tag.content }
          : { property: tag.property, content: tag.content },
    });
  }
  return elements;
};

export const prerender = (data: PrerenderData): PrerenderResult => {
  const path = normalizePath(data.url);
  const tags = pageMeta(path, ROUTE_META[path] ?? {});
  const titleTag = tags.find((tag): tag is { title: string } => 'title' in tag);

  // Enqueue the full route set on every call (the plugin dedupes). The body
  // is empty, so the plugin cannot crawl links out of it — we must drive
  // the list explicitly.
  return {
    html: '',
    links: new Set(ROUTES),
    head: {
      lang: 'en',
      title: titleTag?.title,
      elements: toHeadElements(tags),
    },
  };
};
