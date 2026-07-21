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

/**
 * CSP `script-src` hash of IPFS_BASE_SCRIPT_CONTENT, consumed by the IPFS
 * build's CSP <meta> so the inline script above stays allowed.
 *
 * Precomputed constant: the script body is static, and computing it at
 * module init required Node's `crypto` — which broke the browser bundle
 * (this module is reachable from client code). If you change the script
 * content, recompute with:
 *
 *   node -e "const{createHash}=require('crypto');console.log('sha256-'+createHash('sha256').update(CONTENT).digest('base64'))"
 */
export const IPFS_BASE_SCRIPT_HASH =
  "'sha256-ZBq3TOoWLDZILhGd7gVhWDD+AZvZ/RN0lXRTMVP+hCw='";

// `__IPFS_MODE__` is a build-time define (vite.config.ts) — in non-IPFS
// builds the whole component tree-shakes to null. Replaces the
// webpack-preprocessor-loader `#!if IPFS_MODE` directive.
export const InsertIpfsBaseScript = () => {
  if (!__IPFS_MODE__) return null;
  return (
    <script dangerouslySetInnerHTML={{ __html: IPFS_BASE_SCRIPT_CONTENT }} />
  );
};
