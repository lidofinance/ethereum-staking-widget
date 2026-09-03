/**
 * Per-route SEO head data — framework-agnostic, pure data + serializers.
 *
 * Single source of truth for `<title>`, `<meta name="description">`, and the
 * `og:*` / `twitter:*` link-unfurl block (values from the deleted
 * `pages/_document.tsx`). Consumed at build time by the head-only prerender
 * (`scripts/prerender.ts` via vite-prerender-plugin) so each route's static
 * HTML carries its own head for crawlers that do not run JS.
 *
 * Imports nothing from the app on purpose (only pure-data siblings, via
 * RELATIVE paths — this module also loads inside vite.config.ts, where
 * tsconfig aliases are unavailable): the prerender stays a pure data
 * pipeline, wallet SDKs never load at build time.
 */
import {
  CLAIM_FAQ,
  REQUEST_FAQ,
  type FaqEntry,
} from '../features/withdrawals/withdrawals-faq/faq-data';

export interface PageMetaInput {
  title?: string;
  description?: string;
  /**
   * JSON-LD structured data for this route (schema.org). Serialized into a
   * `<script type="application/ld+json">` tag at the end of `<head>` by the
   * `injectJsonLd` plugin in vite.config.ts. URL fields can use the
   * `__PUBLIC_ORIGIN__` placeholder; the same nginx `sub_filter` that
   * handles `og:image` substitutes it at response time.
   */
  jsonLd?: Record<string, unknown>;
  /**
   * FAQ entries rendered INTO THE PRERENDERED BODY (`#root`) as static
   * semantic HTML + exposed as FAQPage JSON-LD. Safe by construction: the
   * client mounts via `createRoot`, which REPLACES `#root` content on
   * mount — nothing is hydrated, so the "no non-empty prerendered body"
   * hydration invariant is not violated; worst case is a brief unstyled
   * flash before React takes over.
   */
  faq?: FaqEntry[];
}

/** A single `<head>` tag in a transport-neutral shape. `title` is special-cased. */
export type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { rel: string; href: string };

// `__PUBLIC_ORIGIN__` is a build-time placeholder. nginx replaces it in
// served HTML/XML/TXT responses via `sub_filter` (see
// `infra/nginx/default.conf.template`) with `$SELF_ORIGIN` — the same env
// var that feeds `window.__env__.selfOrigin`. Substitution happens at
// response time because `/usr/share/nginx/html` is read-only in the pod.
// Keeps the "one image, many envs" model while still emitting absolute
// URLs for link-unfurl crawlers.
const PREVIEW_IMAGE = '__PUBLIC_ORIGIN__/lido-preview.png';
const TWITTER_SITE = '@lidofinance';

export const DEFAULT_TITLE = 'Stake with Lido | Lido';
export const DEFAULT_DESCRIPTION =
  'Liquid staking with Lido. Stake Ether with Lido to get daily rewards ' +
  'while keeping full control of your staked tokens. Start receiving ' +
  'rewards in just a few clicks.';

/**
 * Build the per-route head tags. `path` (e.g. `'/wrap/unwrap'`) drives the
 * `<link rel="canonical">`; pass `undefined` to skip it (IPFS build).
 */
export const pageMeta = (
  path: string | undefined,
  {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
  }: PageMetaInput = {},
): MetaTag[] => {
  const tags: MetaTag[] = [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: PREVIEW_IMAGE },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image:src', content: PREVIEW_IMAGE },
    { name: 'twitter:site', content: TWITTER_SITE },
  ];
  if (path) {
    tags.push({ rel: 'canonical', href: `__PUBLIC_ORIGIN__${path}` });
  }
  return tags;
};

// ---- FAQ serializers ----

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** schema.org FAQPage from the entries (answers as plain text). */
const faqPageJsonLd = (entries: FaqEntry[]): Record<string, unknown> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(entry.answerHtml) },
    })),
  };
};

/**
 * Static FAQ markup for the prerendered body. Plain semantic HTML — no
 * classes/styles on purpose: it exists for crawlers and no-JS readers and
 * is replaced wholesale when React mounts into `#root`.
 */
export const faqSectionHtml = (entries: FaqEntry[]): string => {
  const items = entries
    .map((entry) => {
      const anchor = entry.id ? ` id="${entry.id}"` : '';
      return `<h3${anchor}>${entry.question}</h3>\n${entry.answerHtml}`;
    })
    .join('\n');
  return `<section aria-label="FAQ">\n<h2>FAQ</h2>\n${items}\n</section>`;
};

// ---- Route → meta map: the prerender route list + per-page head ----

const EARN_VAULTS = ['ggv', 'dvv', 'strategy', 'eth', 'usd'] as const;
const EARN_ACTIONS = ['deposit', 'withdraw'] as const;

const earnRouteMeta = (): Record<string, PageMetaInput> => {
  const out: Record<string, PageMetaInput> = {};
  for (const vault of EARN_VAULTS) {
    for (const action of EARN_ACTIONS) {
      const label = vault.toUpperCase();
      out[`/earn/${vault}/${action}`] = {
        title: `${label} ${action} | Earn | Lido`,
        description: `${label} vault ${action} on Lido`,
      };
    }
  }
  return out;
};

/**
 * Routes prerendered for SEO and their per-page meta. Mirrors the static,
 * non-redirect URL surface of `app/router.tsx`. Redirect-only routes
 * (`/withdrawals`, `/earn/:vault`) and the IPFS-only `/settings` are
 * omitted: the SPA fallback still serves them, just without a tailored
 * head. NOTE: titles/descriptions must match what the route components set
 * via `<Head>` (they own the runtime `<title>`).
 */
export const ROUTE_META: Record<string, PageMetaInput> = {
  '/': {
    // Title / description fall back to DEFAULT_* — the home page IS the
    // canonical description.
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Lido',
      url: '__PUBLIC_ORIGIN__/',
      logo: '__PUBLIC_ORIGIN__/lido-preview.png',
      sameAs: ['https://twitter.com/lidofinance', 'https://lido.fi'],
    },
  },
  '/wrap': {
    title: 'Wrap | Lido',
    description:
      'Wrap stETH into wstETH — the non-rebasing variant of Lido’s ' +
      'liquid staking token, used across DeFi integrations.',
  },
  '/wrap/unwrap': {
    title: 'Wrap | Lido',
    description: 'Unwrap wstETH back to stETH on Lido.',
  },
  '/withdrawals/request': {
    title: 'Withdrawals | Lido',
    description:
      'Request stETH or wstETH withdrawal to ETH from the Lido protocol.',
    faq: REQUEST_FAQ,
    jsonLd: faqPageJsonLd(REQUEST_FAQ),
  },
  '/withdrawals/claim': {
    title: 'Withdrawals | Lido',
    description: 'Claim ETH from completed Lido withdrawal requests.',
    faq: CLAIM_FAQ,
    jsonLd: faqPageJsonLd(CLAIM_FAQ),
  },
  '/rewards': {
    title: 'Track your Ethereum staking rewards | Lido',
    description:
      'Keep track of your daily Ethereum staking rewards using our stETH ' +
      'reward tracker. View stETH balances, historical rewards and transfers.',
  },
  '/earn': {
    title: 'Lido Earn | Lido',
    description:
      'Deploy ETH and USD stablecoins into DeFi vaults for on-chain yield ' +
      "through the world's leading protocols.",
  },
  ...earnRouteMeta(),
};

// ---- Serializers ----

const escapeAttr = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Build a `sitemap.xml` string from `ROUTE_META`. URLs use the
 * `__PUBLIC_ORIGIN__` placeholder — nginx rewrites them per env at
 * response time (sub_filter_types includes xml).
 */
export const sitemapXml = (): string => {
  const urls = Object.keys(ROUTE_META)
    .sort()
    .map((path) => `  <url><loc>__PUBLIC_ORIGIN__${path}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
};

/**
 * Serialize meta tags to an HTML string for static injection (the `title`
 * tag is excluded — callers set `<title>` separately). Used by the IPFS
 * build's `transformIndexHtml` defaults.
 */
export const metaTagsToHtml = (tags: MetaTag[]): string => {
  return tags
    .filter(
      (tag): tag is Exclude<MetaTag, { title: string }> => !('title' in tag),
    )
    .map((tag) => {
      if ('rel' in tag) {
        return `<link rel="${tag.rel}" href="${escapeAttr(tag.href)}" />`;
      }
      if ('name' in tag) {
        return `<meta name="${tag.name}" content="${escapeAttr(tag.content)}" />`;
      }
      return `<meta property="${tag.property}" content="${escapeAttr(tag.content)}" />`;
    })
    .join('\n    ');
};
