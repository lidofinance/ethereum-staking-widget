import { createHash } from 'crypto';

// IPFS Next.js configuration reference:
// https://github.com/Velenir/nextjs-ipfs-example
//
// IPFS_BASE_SCRIPT_HASH is also consumed by config/csp/index.ts for the
// script-src hash, so the CSP hash and the actual script stay in sync.
const IPFS_BASE_SCRIPT_CONTENT = `
(function () {
  const base = document.createElement('base');
  base.href = window.location.pathname;
  document.head.append(base);
})();
`;

export const IPFS_BASE_SCRIPT_HASH = `'sha256-${createHash('sha256').update(IPFS_BASE_SCRIPT_CONTENT).digest('base64')}'`;

let ipfsBaseScript = '';

// #!if IPFS_MODE === "true"
ipfsBaseScript = IPFS_BASE_SCRIPT_CONTENT;
// #!endif

export const InsertIpfsBaseScript = () => {
  return ipfsBaseScript ? (
    <script dangerouslySetInnerHTML={{ __html: ipfsBaseScript }} />
  ) : null;
};
