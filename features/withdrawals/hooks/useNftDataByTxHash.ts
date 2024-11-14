import { decodeEventLog, getEventSelector } from 'viem';
import { useLidoSWR } from '@lido-sdk/react';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import type { TransactionReceipt } from '@ethersproject/abstract-provider';

import { standardFetcher } from 'utils/standardFetcher';
import { useDappStatus, useLidoSDK } from 'modules/web3';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';

const EVENT_NAME = 'WithdrawalRequested';

type NFTApiData = {
  description: string;
  image: string;
  name: string;
};

export const useNftDataByTxHash = (txHash: string | null) => {
  const { address } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const { staticRpcProvider } = useCurrentStaticRpcProvider();

  const swrNftApiData = useLidoSWR(
    address && txHash ? ['swr:nft-data-by-tx-hash', txHash, address] : null,
    async () => {
      if (!txHash || !address) return null;

      const txReciept: TransactionReceipt =
        await staticRpcProvider.getTransactionReceipt(txHash);

      const eventTopic = getEventSelector(
        `${EVENT_NAME}(uint256,address,address,uint256,uint256)`,
      );
      const eventLogs = txReciept.logs.filter(
        (log) => log.topics[0] === eventTopic,
      );
      const events = eventLogs.map((log) => {
        return decodeEventLog({
          abi: WithdrawalQueueAbi,
          data: log.data as `0x${string}`,
          // @ts-expect-error: typing (TODO: viem typing after eventLogs will be changed)
          topics: log.topics,
          eventName: EVENT_NAME,
        });
      });

      const nftDataRequests = events.map((e) => {
        const fetch = async () => {
          // @ts-expect-error: typing (The property 'read' exist!)
          const tokenURI = await withdraw.contract
            .getContractWithdrawalQueue()
            .read.tokenURI([Number(e.args.requestId)]);
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
