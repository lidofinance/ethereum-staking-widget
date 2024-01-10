import { useLidoSWR } from '@lido-sdk/react';
import { BASE_PATH_ASSET, dynamics } from 'config';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { STRATEGY_IMMUTABLE, STRATEGY_LAZY } from 'utils/swrStrategies';

type EnsHashCheckReturn = string | null;

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

const ENS_NAME = dynamics.ipfsEns;

export const useIpfsHashCheck = () => {
  const provider = useMainnetStaticRpcProvider();

  // local cid extraction
  const { data: currentCID } = useLidoSWR(
    ['swr:ipfs-cid-extraction'],
    async () => {
      const urlCid =
        URL_CID_REGEX.exec(window.location.href)?.groups?.cid ?? null;
      if (urlCid) return urlCid;
      const headers = await fetch(`${BASE_PATH_ASSET}/runtime/window-env.js`, {
        method: 'HEAD',
      });
      return headers.headers.get('X-Ipfs-Roots');
    },
    { ...STRATEGY_IMMUTABLE, isPaused: () => !dynamics.ipfsMode },
  );

  // ens cid extraction
  const ensLookupSWR = useLidoSWR<EnsHashCheckReturn>(
    ['swr:ipfs-hash-check', ENS_NAME],
    async ([_, ensName]: [string, string]) => {
      const resolver = await provider.getResolver(ensName);
      if (resolver) {
        const contentHash = await resolver.getContentHash();
        if (contentHash) {
          return contentHash;
        }
      }
      return null;
    },
    { ...STRATEGY_LAZY, isPaused: () => !dynamics.ipfsMode && !!ENS_NAME },
  );

  const isUpdateAvailable = Boolean(
    ensLookupSWR.data && currentCID && ensLookupSWR.data !== currentCID,
  );

  return {
    isUpdateAvailable,
    get data() {
      return ensLookupSWR.data;
    },
    get initialLoading() {
      return ensLookupSWR.initialLoading;
    },
    get loading() {
      return ensLookupSWR.loading;
    },
    get error() {
      return ensLookupSWR.error;
    },
  };
};
