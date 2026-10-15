import { getPrettyChainName } from 'modules/web3';
import { L2StakeModule, type L2SlowStakeLimits } from 'modules/l2-staking';
import { ValidationError } from 'shared/hook-form/validation/validation-error';
import { formatBalance } from 'utils/formatBalance';
import type { TOKENS_TO_STAKE } from 'features/stake/shared/types';

type SlowLaneLimits = {
  // the lane's CCIP bucket, in stake terms; absent while unknown
  limits?: L2SlowStakeLimits;
  chainId: number;
};

const formatWait = (seconds: number) => {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? 'a minute' : `${minutes} minutes`;
};

// The CCIP bucket caps a slow stake twice: above its capacity a stake never
// fits and must be split, above what has refilled it fits after a wait.
// Unknown limits do not block here: the send checks them again right before
// the wallet
export const validateSlowLaneAmount = (
  field: string,
  amount: bigint,
  token: TOKENS_TO_STAKE,
  { limits, chainId }: SlowLaneLimits,
) => {
  if (!limits) return;
  const chainName = getPrettyChainName(chainId);
  const wait = L2StakeModule.calcSlowStakeWaitSeconds(limits, amount);
  if (wait === undefined) {
    throw new ValidationError(
      field,
      `Entered ${token} amount exceeds the per-transaction limit on ${chainName} of ${formatBalance(limits.maxAmount ?? 0n).trimmed} ETH`,
    );
  }
  if (wait > 0) {
    throw new ValidationError(
      field,
      `Staking capacity on ${chainName} is temporarily used up for this amount. Stake up to ${formatBalance(limits.availableAmount ?? 0n).trimmed} ${token} now or try again in ${formatWait(wait)}`,
    );
  }
};
