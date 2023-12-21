// IPFS Next.js configuration reference:
// https://github.com/Velenir/nextjs-ipfs-example

let ipfsBaseScript = '';

// #!if IPFS_MODE === "true"
ipfsBaseScript = `
(function () {
  const base = document.createElement('base');
  base.href = window.location.pathname;
  document.head.append(base);
})();
`;
// #!endif

export const InsertIpfsBaseScript = () => {
  return ipfsBaseScript ? (
    <script dangerouslySetInnerHTML={{ __html: ipfsBaseScript }} />
  ) : null;
};
