import type { Hash } from 'viem';
import { decodeEventLog, getEventSelector } from 'viem';
import { usePublicClient } from 'wagmi';
import { WithdrawalQueueAbi } from '@lidofinance/lido-ethereum-sdk/withdraw';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useDappStatus, useLidoSDK } from 'modules/web3';
import { standardFetcher } from 'utils/standardFetcher';

const EVENT_NAME = 'WithdrawalRequested';

// only `image` is rendered
const NFT_API_DATA_SCHEMA = z.looseObject({ image: z.string() });

type NFTApiData = z.infer<typeof NFT_API_DATA_SCHEMA>;

export const useNftDataByTxHash = (txHash?: Hash) => {
  const { address, chainId } = useDappStatus();
  const { withdraw } = useLidoSDK();
  const publicClient = usePublicClient({ chainId });

  return useQuery<NFTApiData[] | null>({
    queryKey: ['nft-data-by-tx-hash', txHash, address],
    enabled: !!(txHash && address && publicClient),
    ...STRATEGY_IMMUTABLE,
    queryFn: async () => {
      if (!txHash || !address || !publicClient) return null;

      const txReceipt = await publicClient.getTransactionReceipt({
        hash: txHash,
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
          const contractWithdrawalQueue =
            await withdraw.contract.getContractWithdrawalQueue();
          const tokenURI = await contractWithdrawalQueue.read.tokenURI([
            e.args.requestId,
          ]);
          return NFT_API_DATA_SCHEMA.parse(
            await standardFetcher<unknown>(tokenURI),
          );
        };

        return fetch();
      });

      const nftData = await Promise.all(nftDataRequests);

      return nftData;
    },
  });
};
