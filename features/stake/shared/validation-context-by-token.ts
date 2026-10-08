import { useMemo } from 'react';

import { useAwaiter } from 'shared/hooks/use-awaiter';

import { TOKENS_TO_STAKE } from './types';

// One validation context promise per stakeable token: the resolver awaits the
// one for the token being validated
export type ValidationContextByToken<TContext> = Record<
  TOKENS_TO_STAKE,
  Promise<TContext>
>;

type WethBalanceGate = {
  isDappActive: boolean;
  isWethSupported: boolean;
  wethBalance?: bigint;
};

// The WETH balance is a separate token read that can fail on its own, and it
// only resolves on chains that have WETH
export const isWethBalanceReady = ({
  isDappActive,
  isWethSupported,
  wethBalance,
}: WethBalanceGate) =>
  !isDappActive || !isWethSupported || wethBalance !== undefined;

type UseValidationContextByTokenArgs<TContext> = {
  // undefined until all data the ETH validation needs is there
  context: TContext | undefined;
  isWethBalanceReady: boolean;
};

// ETH validation resolves as soon as the context is there, so a failed WETH
// read never blocks an ETH stake. WETH validation additionally waits for the
// WETH balance, which the context then carries
export const useValidationContextByToken = <TContext>({
  context,
  isWethBalanceReady,
}: UseValidationContextByTokenArgs<TContext>): ValidationContextByToken<TContext> => {
  const ethContext = useAwaiter(context).awaiter;
  const wethContext = useAwaiter(
    isWethBalanceReady ? context : undefined,
  ).awaiter;

  return useMemo(
    () => ({
      [TOKENS_TO_STAKE.ETH]: ethContext,
      [TOKENS_TO_STAKE.WETH]: wethContext,
    }),
    [ethContext, wethContext],
  );
};
