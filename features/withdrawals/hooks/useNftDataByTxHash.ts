import { decodeEventLog, getEventSelector } from 'viem';
import { usePublicClient } from 'wagmi';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';

import { STRATEGY_EAGER } from 'consts/react-query-strategies';
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
  const { address, chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const publicClient = usePublicClient({ chainId });

  const queryResult = useLidoQuery<NFTApiData[] | null>({
    queryKey: ['nft-data-by-tx-hash', txHash, address],
    enabled: !!(txHash && address && publicClient),
    queryFn: async () => {
      if (!txHash || !address || !publicClient) return null;

      const txReceipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      const eventTopic = getEventSelector(
        `${EVENT_NAME}(uint256,address,address,uint256,uint256)`,
      );
      const eventLogs = txReceipt.logs.filter(
        (log) => log.topics[0] === eventTopic,
      );
      const events = eventLogs.map((log) => {
        return decodeEventLog({
          abi: WithdrawalQueueAbi,
          data: log.data,
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
