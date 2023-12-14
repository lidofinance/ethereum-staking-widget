import { useLidoSWR } from '@lido-sdk/react';
import { dynamics } from 'config';
import { useEffect, useState } from 'react';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

type EnsHashCheckReturn = {
  cid: string | null;
};

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

const ENS_NAME = 'ethereum.staked.eth';

// try to extract CID from url
const extractCID = () => {
  if (typeof window !== 'undefined') {
    return URL_CID_REGEX.exec(window.location.href)?.groups?.cid ?? null;
  }
  return null;
};

export const useIpfsHashCheck = () => {
  const provider = useMainnetStaticRpcProvider();

  const [currentCID, setCurrentCID] = useState<null | string>(extractCID);
  const swr = useLidoSWR<EnsHashCheckReturn>(
    ['swr:ipfs-hash-check', ENS_NAME, currentCID],
    async ([_, ensName]: [string, string, string | null]) => {
      const resolver = await provider.getResolver(ensName);
      if (resolver) {
        const contentHash = await resolver.getContentHash();
        if (contentHash) {
          return {
            cid: contentHash,
          };
        }
      }
      return {
        cid: null,
      };
    },
    { ...STRATEGY_LAZY, isPaused: () => !dynamics.ipfsMode },
  );

  useEffect(() => {
    if (swr.data?.cid && !currentCID) {
      setCurrentCID(swr.data.cid);
    }
  }, [swr.data?.cid, currentCID]);

  const isUpdateAvailable = Boolean(
    swr.data?.cid && currentCID && swr.data.cid !== currentCID,
  );

  return {
    isUpdateAvailable,
    get data() {
      return swr.data;
    },
    get initialLoading() {
      return swr.initialLoading;
    },
    get loading() {
      return swr.loading;
    },
    get error() {
      return swr.error;
    },
  };
};
