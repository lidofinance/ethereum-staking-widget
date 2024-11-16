import { useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useMainnetStaticRpcProvider } from 'shared/hooks/use-mainnet-static-rpc-provider';
import { useLidoQuery } from 'shared/hooks/use-lido-query';

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

  // we only need this as 'react query result' because of possible future ENS support
  // otherwise there is no fetch
  const queryResult = useLidoQuery<EnsHashCheckReturn>({
    queryKey: ['use-remote-version', externalConfigSwr.data],
    strategy: STRATEGY_LAZY,
    enabled: !!(data || error),
    queryFn: async (): Promise<EnsHashCheckReturn> => {
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
  });

  // merged externalConfigSwr && cidSwr
  return {
    data: queryResult.data,
    get initialLoading() {
      return (
        queryResult.initialLoading ||
        (externalConfigSwr.data == null && externalConfigSwr.isValidating)
      );
    },
    get loading() {
      return queryResult.loading || externalConfigSwr.isValidating;
    },
    get error() {
      return queryResult.error || error;
    },
    update: queryResult.refetch,
  };
};
