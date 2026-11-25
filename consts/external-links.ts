import invariant from 'tiny-invariant';
import { optimism, unichain } from 'viem/chains';

import { config } from 'config';

export const LINK_ADD_NFT_GUIDE = `${config.helpOrigin}/en/articles/7858367-how-do-i-add-the-lido-nft-to-metamask`;

export const OPEN_OCEAN_REFERRAL_ADDRESS =
  '0xbb1263222b2c020f155d409dba05c4a3861f18f8';

export const GITHUB_RAW_MAIN_PATH =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main';

// for dev and local testing you can set VITE_DANGEROUS_DEV_ONLY_OVERRIDE_IPFS_CONFIG_PATH
// to 'http://localhost:3000/runtime/IPFS.json' and have file at /public/runtime/IPFS.json
// This is dangerous behavior so not usual env delivery is used and invariant
// is present. (Was NEXT_PUBLIC_* — Vite inlines import.meta.env at build.)
const IPFS_MANIFEST_URL_OVERRIDE = import.meta.env
  .VITE_DANGEROUS_DEV_ONLY_OVERRIDE_IPFS_CONFIG_PATH as string | undefined;

// NB: pinned IPFS builds read IPFS.json from main indefinitely — keep both files in sync
export const REMOTE_CONFIG_MANIFEST_URL =
  IPFS_MANIFEST_URL_OVERRIDE ||
  GITHUB_RAW_MAIN_PATH + '/REMOTE_CONFIG_MANIFEST.json';

invariant(
  !(!config.developmentMode && IPFS_MANIFEST_URL_OVERRIDE),
  'Overriding IPFS config path is only allowed in development mode',
);
// Superbridge deep link: the token pair and the direction come from query params
const WSTETH_MAINNET = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0';
const WSTETH_BY_L2: Record<
  'unichain' | 'optimism',
  { chainId: number; address: string }
> = {
  unichain: {
    chainId: unichain.id,
    address: '0xc02fE7317D4eb8753a02c35fe019786854A92001',
  },
  optimism: {
    chainId: optimism.id,
    address: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
  },
};

export const superbridgeWstethLink = (
  l2: keyof typeof WSTETH_BY_L2,
  direction: 'to-l2' | 'to-mainnet',
) => {
  const { chainId, address } = WSTETH_BY_L2[l2];
  const [from, to] =
    direction === 'to-l2'
      ? [
          { chainId: 1, address: WSTETH_MAINNET },
          { chainId, address },
        ]
      : [
          { chainId, address },
          { chainId: 1, address: WSTETH_MAINNET },
        ];
  return `https://superbridge.app/?fromChainId=${from.chainId}&toChainId=${to.chainId}&fromTokenAddress=${from.address}&toTokenAddress=${to.address}`;
};
