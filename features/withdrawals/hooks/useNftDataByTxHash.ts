import { useWeb3 } from 'reef-knot/web3-react';
import { useLidoSWR } from '@lido-sdk/react';
import { useWithdrawalsContract } from './contract/useWithdrawalsContract';

import { standardFetcher } from 'utils/standardFetcher';
import type { TransactionReceipt } from '@ethersproject/abstract-provider';

const EVENT_NAME = 'WithdrawalRequested';

type NFTApiData = {
  description: string;
  image: string;
  name: string;
};

export const useNftDataByTxHash = (txHash: string | null) => {
  const { contractRpc, account } = useWithdrawalsContract();
  const { library } = useWeb3();

  const swrNftApiData = useLidoSWR(
    account && txHash ? ['swr:nft-data-by-tx-hash', txHash, account] : null,
    async () => {
      if (!txHash || !account) return null;

      const txReciept: TransactionReceipt = await library.getTransactionReceipt(
        txHash,
      );

      const eventTopic = contractRpc.interface.getEventTopic(EVENT_NAME);
      const eventLogs = txReciept.logs.filter(
        (log) => log.topics[0] === eventTopic,
      );
      const events = eventLogs.map((log) =>
        contractRpc.interface.decodeEventLog(EVENT_NAME, log.data, log.topics),
      );

      const nftDataRequests = events.map((e) =>
        (async () => {
          const tokenURI = await contractRpc.tokenURI(Number(e.requestId));
          const nftData = await standardFetcher<NFTApiData>(tokenURI);
          return nftData;
        })(),
      );

      const nftData = await Promise.all(nftDataRequests);

      return nftData;
    },
  );

  return swrNftApiData;
};
