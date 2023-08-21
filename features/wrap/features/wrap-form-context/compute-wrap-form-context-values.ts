import { TOKENS_TO_WRAP, TokensWrappable } from 'features/wrap/types';
import { WrapFormNetworkData } from './types';

type WrapFormComputeValuesArgs = {
  token: TokensWrappable;
  networkData: WrapFormNetworkData;
};

export const computeWrapFormContextValues = ({
  token,
  networkData,
}: WrapFormComputeValuesArgs) => {
  const { maxAmountStETH, maxAmountETH, gasLimitStETH, gasLimitETH } =
    networkData;
  const isSteth = token === TOKENS_TO_WRAP.STETH;
  return {
    isSteth,
    maxAmount: isSteth ? maxAmountStETH : maxAmountETH,
    wrapGasLimit: isSteth ? gasLimitStETH : gasLimitETH,
  };
};
