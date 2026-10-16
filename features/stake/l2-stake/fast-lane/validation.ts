import { getPrettyChainName } from 'modules/web3';
import { validateBigintMax } from 'shared/hook-form/validation/validate-bigint-max';
import { formatBalance } from 'utils/formatBalance';
import type { TOKENS_TO_STAKE } from 'features/stake/shared/types';

type FastLaneLimits = {
  // the ETH the pool can take right now
  etherLiquidity: bigint;
  // the liquidity the pool is kept at; absent when not configured
  etherLiquidityTarget?: bigint;
  chainId: number;
};

// The pool's liquidity caps a fast stake. Between the current liquidity and
// the pool's target the error carries no message: the form shows a soft state
// there and the banner explains that the pool refills
export const validateFastLaneAmount = (
  field: string,
  amount: bigint,
  token: TOKENS_TO_STAKE,
  { etherLiquidity, etherLiquidityTarget, chainId }: FastLaneLimits,
) => {
  const chainName = getPrettyChainName(chainId);
  // default message, only used when we don't know target liquidity level
  let aboveLiquidityMessage = `Entered ${token} amount exceeds current staking limit on ${chainName} of ${formatBalance(etherLiquidity).trimmed} ETH`;

  if (etherLiquidityTarget !== undefined) {
    // when pool is below its target liquidity, we show soft-error glow and special UI banner
    if (amount <= etherLiquidityTarget) aboveLiquidityMessage = '';
    // when pool is at target level or MORE we show a hard error message
    if (amount > etherLiquidityTarget)
      aboveLiquidityMessage = `Entered ${token} amount exceeds total pool capacity on ${chainName}`;
  }

  // It's important that final validation compares to etherLiquidity rather than target
  // target value can be stale and pool can have much more liquidity than the target
  validateBigintMax(field, amount, etherLiquidity, aboveLiquidityMessage);
};
