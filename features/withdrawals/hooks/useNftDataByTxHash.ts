import { decodeEventLog, getEventSelector } from 'viem';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import type { TransactionReceipt } from '@ethersproject/abstract-provider';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
import { useCurrentStaticRpcProvider } from 'shared/hooks/use-current-static-rpc-provider';
import { useLidoQuery } from 'shared/hooks/use-lido-query';
import { useDappStatus, useLidoSDK } from 'modules/web3';
import { standardFetcher } from 'utils/standardFetcher';

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

  const queryResult = useLidoQuery<NFTApiData[] | null>({
    queryKey: ['nft-data-by-tx-hash', txHash, address],
    enabled: !!(txHash && address),
    queryFn: async () => {
      if (!txHash || !address) return null;

      const txReceipt: TransactionReceipt =
        await staticRpcProvider.getTransactionReceipt(txHash);

      const eventTopic = getEventSelector(
        `${EVENT_NAME}(uint256,address,address,uint256,uint256)`,
      );
      const eventLogs = txReceipt.logs.filter(
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
          const tokenURI = await withdraw.contract
            .getContractWithdrawalQueue()
            // @ts-expect-error: typing (The property 'read' exists!)
            .read.tokenURI([Number(e.args.requestId)]);
          const nftData = await standardFetcher<NFTApiData>(tokenURI);
          return nftData;
        };

        return fetch();
      });

      const nftData = await Promise.all(nftDataRequests);

      return nftData;
    },
    strategy: STRATEGY_EAGER,
  });

  return queryResult;
};
