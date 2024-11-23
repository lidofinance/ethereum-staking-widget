import { getEnsResolver, getEnsText } from 'viem/ens';
import { useQuery } from '@tanstack/react-query';
import { CHAINS } from '@lidofinance/lido-ethereum-sdk';
import { usePublicClient } from 'wagmi';
import { useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';

type EnsHashCheckReturn = {
  cid: string;
  ens?: string;
  leastSafeVersion?: string;
  link: string;
};

export const useRemoteVersion = () => {
  const publicClient = usePublicClient({ chainId: CHAINS.Mainnet });

  // we use directly non-optimistic manifest data
  // can't trust static props(in IPFS esp) to generate warnings/disconnect wallet
  const externalConfigQueryReact = useConfig().externalConfig.fetchMeta;
  const { data, error } = externalConfigQueryReact;

  // we only need this as 'react query result' because of possible future ENS support
  // otherwise there is no fetch
  const queryResult = useQuery<EnsHashCheckReturn>({
    queryKey: ['use-remote-version', externalConfigQueryReact.data],
    ...STRATEGY_LAZY,
    enabled: !!(data || error),
    queryFn: async (): Promise<EnsHashCheckReturn> => {
      if (data?.ens) {
        // @ts-expect-error: it works, but typing issue
        const resolverAddress = await getEnsResolver(publicClient, {
          name: data.ens,
        });
        if (resolverAddress) {
          // @ts-expect-error: it works, but typing issue
          const contentHash = await getEnsText(publicClient, {
            name: data.ens,
            key: 'contenthash',
          });
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

  // merged externalConfigQueryReact && cidQueryResult (queryResult)
  return {
    data: queryResult.data,
    get isLoading() {
      return queryResult.isLoading || externalConfigQueryReact.isLoading;
    },
    get isFetching() {
      return queryResult.isFetching || externalConfigQueryReact.isFetching;
    },
    get error() {
      return queryResult.error || error;
    },
    update: queryResult.refetch,
  };
};
