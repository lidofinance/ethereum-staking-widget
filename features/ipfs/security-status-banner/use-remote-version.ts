import { type PublicClient } from 'viem';
import { getEnsResolver, getEnsText } from 'viem/ens';
import { useQuery } from '@tanstack/react-query';

import { usePublicClient } from 'wagmi';
import { useConfig } from 'config';
import { STRATEGY_LAZY } from 'consts/react-query-strategies';
import { useWagmiMainnetOnlyConfig } from 'modules/web3';

type EnsHashCheckReturn = {
  cid: string;
  ens?: string;
  leastSafeVersion?: string;
  link: string;
};

export const useRemoteVersion = () => {
  const wagmiConfig = useWagmiMainnetOnlyConfig();
  // it works, but typing issue
  const publicClientMainnet = usePublicClient({
    config: wagmiConfig,
  }) as PublicClient;

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
        const resolverAddress = await getEnsResolver(publicClientMainnet, {
          name: data.ens,
        });
        if (resolverAddress) {
          const contentHash = await getEnsText(publicClientMainnet, {
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
