import { useWeb3 } from 'reef-knot/web3-react';
import { useLidoSWR } from '@lido-sdk/react';
import { useWithdrawalsContract } from './contract/useWithdrawalsContract';

import { getEventsWithdrawalRequested } from '../utils/get-events-withdrawal-requested';
import { standardFetcher } from 'utils/standardFetcher';

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

      const { blockNumber } = await library.getTransactionReceipt(txHash);

      const events = await getEventsWithdrawalRequested(
        contractRpc,
        account,
        blockNumber,
      );

      const tokenURIrequests = events.map((e) =>
        contractRpc.tokenURI(Number(e.requestId)),
      );

      const tokenURIs = await Promise.all(tokenURIrequests);

      const nftDataRequests = tokenURIs.map((tokenURI) =>
        standardFetcher<NFTApiData>(tokenURI),
      );

      const nftData = await Promise.all(nftDataRequests);

      return nftData;
    },
  );

  return swrNftApiData;
};
