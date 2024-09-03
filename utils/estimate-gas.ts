import { StaticJsonRpcBatchProvider } from '@lidofinance/eth-providers';
import { PopulatedTransaction } from 'ethers';

export const estimateGas = async (
  tx: PopulatedTransaction,
  provider: StaticJsonRpcBatchProvider,
) => {
  try {
    return await provider.estimateGas(tx);
  } catch (error) {
    // retry without fees to see if just fails
    const result = await provider
      .estimateGas({
        ...tx,
        maxFeePerGas: undefined,
        maxPriorityFeePerGas: undefined,
      })
      .catch(() => null);
    // rethrow original not enough ether error
    if (result) {
      throw error;
    }
    throw new Error('Something went wrong');
  }
};
