import { useLidoSWR } from '@lido-sdk/react';
import { config } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { standardFetcher } from 'utils/standardFetcher';

type EnsHashCheckReturn = {
  cid: string;
  ens?: string;
  leastSafeVersion?: string;
  link: string;
} | null;

type ReleaseInfoData = Record<string, ReleaseInfo>;

type ReleaseInfo = {
  cid?: string;
  ens?: string;
  leastSafeVersion?: string;
};

// for dev and local testing you can set to '/runtime/IPFS.json' and have file at /public/runtime/
const IPFS_RELEASE_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

export const useRemoteVersion = () => {
  const provider = useMainnetStaticRpcProvider();
  // ens cid extraction
  return useLidoSWR<EnsHashCheckReturn>(
    ['swr:use-remote-version'],
    async (): Promise<EnsHashCheckReturn> => {
      const releaseInfoData = await standardFetcher<ReleaseInfoData>(
        IPFS_RELEASE_URL,
        {
          headers: { Accept: 'application/json' },
        },
      );

      const releaseInfo = releaseInfoData[config.defaultChain.toString()];
      if (releaseInfo?.ens) {
        const resolver = await provider.getResolver(releaseInfo.ens);
        if (resolver) {
          const contentHash = await resolver.getContentHash();
          if (contentHash) {
            return {
              cid: contentHash,
              ens: releaseInfo.ens,
              link: `https://${releaseInfo.ens}.limo`,
              leastSafeVersion: releaseInfo.leastSafeVersion,
            };
          }
        }
      }
      if (releaseInfo?.cid) {
        return {
          cid: releaseInfo.cid,
          link: `https://${releaseInfo.cid}.ipfs.cf-ipfs.com`,
          leastSafeVersion: releaseInfo.leastSafeVersion,
        };
      }

      throw new Error('invalid IPFS manifest content');
    },
    { ...STRATEGY_LAZY },
  );
};
