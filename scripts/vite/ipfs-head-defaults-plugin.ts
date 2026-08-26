import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

import { metaTagsToHtml, pageMeta } from '../../shared/seo';

/**
 * IPFS serves a single `index.html` (no path-based routing), so the
 * per-route prerender plugin is off there. Inject the default
 * og/twitter/description block statically (no canonical — the gateway URL
 * isn't canonical), the CSP `<meta http-equiv>` (was `_document.tsx` +
 * next-secure-headers; directives that only work as HTTP headers —
 * frame-ancestors, report-uri — are omitted per spec), and relativize
 * absolute asset hrefs so the build works from any gateway path prefix.
 */
export const ipfsHeadDefaultsPlugin = (): Plugin => {
  // IPFS SPA base-path reference:
  // https://github.com/Velenir/nextjs-ipfs-example
  //
  // IPFS gateways serve the build from arbitrary path prefixes
  // (/ipfs/<CID>/...), so relative asset URLs need a <base> pointing at the
  // current directory. The script must run before the bundle evaluates.
  const IPFS_BASE_SCRIPT_CONTENT = `
(function () {
  const base = document.createElement('base');
  base.href = window.location.pathname;
  document.head.append(base);
})();
`;

  const IPFS_BASE_SCRIPT_HASH =
    'sha256-' +
    createHash('sha256').update(IPFS_BASE_SCRIPT_CONTENT).digest('base64');

  // Mirrors the non-report parts of the legacy config/csp for IPFS mode.
  const csp = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.reown.com",
    "img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com",
    // The only inline script in the IPFS build is the <base> bootstrap
    // above. (The legacy lido-ui cookie-theme hash 'sha256-wTvVT3oJ…' is
    // gone: the SPA initializes theme via initGlobalCookieTheme inside the
    // bundle, ScriptThemeValue is rendered nowhere.)
    `script-src 'self' ${IPFS_BASE_SCRIPT_HASH}`,
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com",
    "child-src 'self' https://*.walletconnect.org https://*.walletconnect.com",
    "worker-src 'none'",
    "object-src 'none'",
    "media-src 'self'",
    "manifest-src 'self'",
    "form-action 'self'",
    "script-src-attr 'none'",
  ].join('; ');

  return {
    name: 'ipfs-head-defaults',
    transformIndexHtml(html) {
      return html.replace(/(href|src)="\//g, '$1="./').replace(
        '</head>',
        `<script>${IPFS_BASE_SCRIPT_CONTENT}</script>
<meta http-equiv="Content-Security-Policy" content="${csp}" />
${metaTagsToHtml(pageMeta(undefined))}\n  </head>`,
      );
    },
  };
};
