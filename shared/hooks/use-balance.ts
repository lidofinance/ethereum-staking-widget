import { useQueryClient } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import { useBlockNumber, useBalance, useAccount } from 'wagmi';
import type { GetBalanceData } from 'wagmi/query';

const dataToBN = (data: GetBalanceData) =>
  BigNumber.from(data.value.toString());

export const useEthereumBalance = () => {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const queryData = useBalance({
    address,
    query: { select: dataToBN, staleTime: 7000, enabled: !!address },
  });

  useEffect(() => {
    void queryClient.invalidateQueries(
      { queryKey: queryData.queryKey },
      // this tells RQ to not force another refetch if this query is already revalidating
      // dedups rpc requests
      { cancelRefetch: false },
    );
  }, [blockNumber, queryClient, queryData.queryKey]);

  return queryData;
};
