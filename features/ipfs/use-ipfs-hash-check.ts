import { useLidoSWR } from '@lido-sdk/react';
import { dynamics } from 'config';
import { useEffect, useState } from 'react';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

type EnsHashCheckReturn = {
  cid: string | null;
};

const ENS_NAME = 'ethereum.staked.eth';

export const useIpfsHashCheck = () => {
  const provider = useMainnetStaticRpcProvider();

  const [currentCID, setCurrentCID] = useState<null | string>(() => {
    // try to extract CID from url
    if (typeof window !== 'undefined') {
      const cidRegExp = new RegExp(
        '(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})',
      );
      return cidRegExp.exec(window.location.href)?.[0] ?? null;
    }
    return null;
  });
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
