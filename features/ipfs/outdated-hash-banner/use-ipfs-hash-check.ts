import { useLidoSWR } from '@lido-sdk/react';
import { BASE_PATH_ASSET, dynamics } from 'config';
import { useState } from 'react';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { standardFetcher } from 'utils/standardFetcher';
import { STRATEGY_IMMUTABLE, STRATEGY_LAZY } from 'utils/swrStrategies';

type EnsHashCheckReturn = {
  cid: string;
  ens?: string;
  link: string;
} | null;

type ReleaseInfoData = ReleaseInfo & Record<string, ReleaseInfo | undefined>;

type ReleaseInfo = {
  cid?: string;
  ens?: string;
};

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

// for dev and local testing you can set to '/runtime/IPFS.json' and have file at /public/runtime/
const IPFS_RELEASE_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

export const useIpfsHashCheck = () => {
  const [areConditionsAccepted, setConditionsAccepted] = useState(false);
  const provider = useMainnetStaticRpcProvider();

  // local cid extraction
  const currentCidSWR = useLidoSWR(
    ['swr:ipfs-cid-extraction'],
    async () => {
      const urlCid = URL_CID_REGEX.exec(window.location.href)?.groups?.cid;
      if (urlCid) return urlCid;
      const headers = await fetch(`${BASE_PATH_ASSET}/runtime/window-env.js`, {
        method: 'HEAD',
      });
      return headers.headers.get('X-Ipfs-Roots');
    },
    { ...STRATEGY_IMMUTABLE, isPaused: () => !dynamics.ipfsMode },
  );

  // ens cid extraction
  const remoteCidSWR = useLidoSWR<EnsHashCheckReturn>(
    ['swr:ipfs-hash-check'],
    async (): Promise<EnsHashCheckReturn> => {
      const releaseInfoData = await standardFetcher<ReleaseInfoData>(
        IPFS_RELEASE_URL,
        {
          headers: { Accept: 'application/json' },
        },
      );

      // look up for subpath
      const releaseInfo = dynamics.ipfsManifestSubpath
        ? releaseInfoData[dynamics.ipfsManifestSubpath]
        : releaseInfoData;

      if (releaseInfo?.ens) {
        const resolver = await provider.getResolver(releaseInfo.ens);
        if (resolver) {
          const contentHash = await resolver.getContentHash();
          if (contentHash) {
            return {
              cid: contentHash,
              ens: releaseInfo.ens,
              link: `https://${releaseInfo.ens}.limo`,
            };
          }
        }
      }
      if (releaseInfo?.cid) {
        return {
          cid: releaseInfo.cid,
          link: `https://${releaseInfo.cid}.ipfs.cf-ipfs.com`,
        };
      }
      return null;
    },
    { ...STRATEGY_LAZY, isPaused: () => !dynamics.ipfsMode },
  );

  const isUpdateAvailable = Boolean(
    !areConditionsAccepted &&
      remoteCidSWR.data &&
      currentCidSWR.data &&
      remoteCidSWR.data.cid !== currentCidSWR.data,
  );

  return {
    isUpdateAvailable,
    setConditionsAccepted,
    get data() {
      return {
        remoteCid: remoteCidSWR.data?.cid,
        currentCid: currentCidSWR.data,
        remoteCidLink: remoteCidSWR.data?.link,
      };
    },
    get initialLoading() {
      return remoteCidSWR.initialLoading || currentCidSWR.initialLoading;
    },
    get loading() {
      return remoteCidSWR.loading || currentCidSWR.loading;
    },
    get error() {
      return remoteCidSWR.error || currentCidSWR.error;
    },
  };
};
