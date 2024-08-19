import { useLidoSWR } from '@lido-sdk/react';
import { useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';

type EnsHashCheckReturn = {
  cid: string;
  ens?: string;
  leastSafeVersion?: string;
  link: string;
};

export const useRemoteVersion = () => {
  const provider = useMainnetStaticRpcProvider();

  // we use directly non-optimistic manifest data
  // can't trust static props(in IPFS esp) to generate warnings/disconnect wallet
  const externalConfigSwr = useConfig().externalConfig.fetchMeta;
  const { data, error } = externalConfigSwr;

  const swr = useLidoSWR<EnsHashCheckReturn>(
    ['swr:use-remote-version', externalConfigSwr.data],
    async (): Promise<EnsHashCheckReturn> => {
      if (data?.ens) {
        const resolver = await provider.getResolver(data.ens);
        if (resolver) {
          const contentHash = await resolver.getContentHash();
          if (contentHash) {
            return {
              cid: contentHash,
              ens: data.ens,
              link: `https://${data.ens}.limo`,
              leastSafeVersion: data.leastSafeVersion,
            };
          }
        }
      }
      if (data?.cid) {
        return {
          cid: data.cid,
          link: `https://${data.cid}.ipfs.cf-ipfs.com`,
          leastSafeVersion: data.leastSafeVersion,
        };
      }

      throw new Error('[useRemoteVersion] invalid IPFS manifest content');
    },
    {
      ...STRATEGY_LAZY,
      // we postpone fetch if we don't have external data and don't have error
      // empty data will force fetcher to produce correct error
      isPaused: () => !(data || error),
    },
  );

  // merged externalConfigSwr && cidSwr
  return {
    data: swr.data,
    get initialLoading() {
      return (
        swr.initialLoading ||
        (externalConfigSwr.data == null && externalConfigSwr.isValidating)
      );
    },
    get loading() {
      return swr.loading || externalConfigSwr.isValidating;
    },
    get error() {
      return swr.error || error;
    },
    update: swr.update,
  };
};
