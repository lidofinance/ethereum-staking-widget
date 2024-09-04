import { useLidoSWR } from '@lido-sdk/react';
import { useWithdrawalsContract } from './contract/useWithdrawalsContract';

import { standardFetcher } from 'utils/standardFetcher';
import type { TransactionReceipt } from '@ethersproject/abstract-provider';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

const EVENT_NAME = 'WithdrawalRequested';

type NFTApiData = {
  description: string;
  image: string;
  name: string;
};

export const useNftDataByTxHash = (txHash: string | null) => {
  const { contractRpc, address } = useWithdrawalsContract();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();

  const swrNftApiData = useLidoSWR(
    address && txHash ? ['swr:nft-data-by-tx-hash', txHash, address] : null,
    async () => {
      if (!txHash || !address) return null;

      const txReciept: TransactionReceipt =
        await staticRpcProvider.getTransactionReceipt(txHash);

      const eventTopic = contractRpc.interface.getEventTopic(EVENT_NAME);
      const eventLogs = txReciept.logs.filter(
        (log) => log.topics[0] === eventTopic,
      );
      const events = eventLogs.map((log) =>
        contractRpc.interface.decodeEventLog(EVENT_NAME, log.data, log.topics),
      );

      const nftDataRequests = events.map((e) => {
        const fetch = async () => {
          const tokenURI = await contractRpc.tokenURI(Number(e.requestId));
          const nftData = await standardFetcher<NFTApiData>(tokenURI);
          return nftData;
        };

        return fetch();
      });

      const nftData = await Promise.all(nftDataRequests);

      return nftData;
    },
  );

  return swrNftApiData;
};
