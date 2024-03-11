import { useEffect, useState } from 'react';
import { useLidoSWR } from '@lido-sdk/react';
import { useForceDisconnect } from 'reef-knot/core-react';

import { BASE_PATH_ASSET, dynamics } from 'config';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { standardFetcher } from 'utils/standardFetcher';
import { STRATEGY_IMMUTABLE, STRATEGY_LAZY } from 'utils/swrStrategies';

import buildInfo from 'build-info.json';
import { useClientConfig } from 'providers/client-config';
import { useWeb3 } from 'reef-knot/web3-react';

export const NO_SAFE_VERSION = 'NONE_AVAILABLE';

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

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

// for dev and local testing you can set to '/runtime/IPFS.json' and have file at /public/runtime/
const IPFS_RELEASE_URL =
  'https://raw.githubusercontent.com/lidofinance/ethereum-staking-widget/main/IPFS.json';

const isVersionLess = (versionA: string, versionB: string): boolean => {
  const verA = versionA
    .trim()
    .split('.')
    .map((v) => parseInt(v));
  const verB = versionB
    .trim()
    .split('.')
    .map((v) => parseInt(v));

  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < verA.length; index++) {
    const a = verA[index];
    const b = verB[index];
    // validation
    if (b === undefined || isNaN(a) || isNaN(b)) return false;
    if (a > b) return false;
    if (a < b) return true;
  }
  // versions are  equal
  return false;
};

export const useVersionCheck = () => {
  const { active } = useWeb3();
  const { setIsWalletConnectionAllowed } = useClientConfig();
  const { forceDisconnect } = useForceDisconnect();
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
  const remoteVersionSWR = useLidoSWR<EnsHashCheckReturn>(
    ['swr:ipfs-hash-check'],
    async (): Promise<EnsHashCheckReturn> => {
      const releaseInfoData = await standardFetcher<ReleaseInfoData>(
        IPFS_RELEASE_URL,
        {
          headers: { Accept: 'application/json' },
        },
      );

      const releaseInfo = releaseInfoData[dynamics.defaultChain.toString()];
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
      return null;
    },
    { ...STRATEGY_LAZY },
  );

  const isUpdateAvailable = Boolean(
    remoteVersionSWR.data &&
      currentCidSWR.data &&
      remoteVersionSWR.data.cid !== currentCidSWR.data &&
      remoteVersionSWR.data.leastSafeVersion !== NO_SAFE_VERSION,
  );

  const isVersionUnsafe = Boolean(
    remoteVersionSWR.data?.leastSafeVersion &&
      (remoteVersionSWR.data.leastSafeVersion === NO_SAFE_VERSION ||
        isVersionLess(
          buildInfo.version,
          remoteVersionSWR.data.leastSafeVersion,
        )),
  );

  const isNotVerifiable = !!remoteVersionSWR.error;

  // disconnect wallet and disallow connection for unsafe versions
  useEffect(() => {
    if (isVersionUnsafe) {
      setIsWalletConnectionAllowed(false);
    }
    if (isVersionUnsafe || (dynamics.ipfsMode && isNotVerifiable)) {
      forceDisconnect();
    }
  }, [
    active,
    forceDisconnect,
    isNotVerifiable,
    isVersionUnsafe,
    setIsWalletConnectionAllowed,
  ]);

  return {
    setConditionsAccepted,
    areConditionsAccepted,
    isNotVerifiable,
    isVersionUnsafe,
    isUpdateAvailable,

    get data() {
      return {
        remoteCid: remoteVersionSWR.data?.cid,
        currentCid: currentCidSWR.data,
        remoteCidLink: remoteVersionSWR.data?.link,
      };
    },
    get initialLoading() {
      return remoteVersionSWR.initialLoading || currentCidSWR.initialLoading;
    },
    get loading() {
      return remoteVersionSWR.loading || currentCidSWR.loading;
    },
    get error() {
      return remoteVersionSWR.error || currentCidSWR.error;
    },
  };
};
