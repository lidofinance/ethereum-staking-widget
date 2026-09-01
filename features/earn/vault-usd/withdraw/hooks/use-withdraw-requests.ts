import invariant from 'tiny-invariant';
import { useMemo } from 'react';
import { useWithdrawRequests } from 'modules/mellow-meta-vaults/hooks/use-withdraw-requests';
import { useMainnetOnlyWagmi } from 'modules/web3';
import { TOKENS } from 'consts/tokens';
import { getRedeemQueueContract } from '../../contracts';
import { mergeUsdWithdrawRequests } from '../utils';

export const useUsdVaultWithdrawRequests = () => {
  const { publicClientMainnet } = useMainnetOnlyWagmi();
  invariant(publicClientMainnet, 'Public client is not available');

  const usdcRedeemQueue = useMemo(
    () =>
      getRedeemQueueContract({
        publicClient: publicClientMainnet,
        token: TOKENS.usdc,
      }),
    [publicClientMainnet],
  );

  const usdtRedeemQueue = useMemo(
    () =>
      getRedeemQueueContract({
        publicClient: publicClientMainnet,
        token: TOKENS.usdt,
      }),
    [publicClientMainnet],
  );

  const usdcQuery = useWithdrawRequests({ redeemQueue: usdcRedeemQueue });
  const usdtQuery = useWithdrawRequests({ redeemQueue: usdtRedeemQueue });

  const data = useMemo(
    () =>
      mergeUsdWithdrawRequests([
        { token: TOKENS.usdc, requests: usdcQuery.data?.requests },
        { token: TOKENS.usdt, requests: usdtQuery.data?.requests },
      ]),
    [usdcQuery.data, usdtQuery.data],
  );

  return {
    data,
    isLoading: usdcQuery.isLoading || usdtQuery.isLoading,
    isFetching: usdcQuery.isFetching || usdtQuery.isFetching,
  };
};
