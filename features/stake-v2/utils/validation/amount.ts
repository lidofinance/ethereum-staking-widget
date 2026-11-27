import { maxUint256 } from 'viem';
import { z } from 'zod';

import { LIMIT_LEVEL } from 'types';

import { errorTexts } from '../error-texts';

import { SILENT_ISSUE } from './parse';

// Amount checks as zod refinements, chained onto a bigint schema in order:
// the first failing check is the one reported. Messages are kept from the
// previous validators (shared/hook-form/validation)

export type AmountCheck = (schema: z.ZodBigInt) => z.ZodBigInt;

/** chains `checks` onto one bigint schema, in order */
export const amountSchema = (...checks: AmountCheck[]) =>
  checks.reduce<z.ZodBigInt>((schema, check) => check(schema), z.bigint());

/**
 * The amount field of a form schema: `bigint | null` in, `bigint` out. No
 * amount (empty, or 0) fails with the empty `amountRequired`: it blocks
 * submit without an error text.
 */
export const requiredAmount = () =>
  z
    .bigint()
    .nullable()
    .transform((amount, ctx) => {
      if (amount === null || amount === 0n) {
        ctx.addIssue({
          code: 'custom',
          message: errorTexts.forms.general.amountRequired(),
          // the text is empty on purpose; zod would put its default there
          params: SILENT_ISSUE,
        });
        return z.NEVER;
      }
      return amount;
    });

/**
 * 0 < amount <= uint256. A safety net: requiredAmount already turned 0
 * away, and the amount input never produces a negative or overflowing one
 */
export const validAmount =
  (symbol: string): AmountCheck =>
  (schema) =>
    schema
      .positive(errorTexts.forms.general.amountInvalid(symbol))
      .max(maxUint256, errorTexts.forms.general.amountInvalid(symbol));

type StakeLimitArgs = {
  level: LIMIT_LEVEL;
  currentStakeLimit: bigint;
};

/** Lido's stake limit applies: none left, or not this much */
export const withinStakeLimit =
  ({ level, currentStakeLimit }: StakeLimitArgs, symbol: string): AmountCheck =>
  (schema) =>
    schema
      .refine(
        () => level !== LIMIT_LEVEL.REACHED,
        errorTexts.forms.stake.stakeLimitReached(),
      )
      .max(
        currentStakeLimit,
        errorTexts.forms.stake.stakeLimitExceeded(currentStakeLimit, symbol),
      );

/** amount <= max, with the caller's message */
export const atMost =
  (max: bigint, message: string): AmountCheck =>
  (schema) =>
    schema.max(max, message);

/** amount <= max, with a message that depends on the amount */
export const atMostWith =
  (max: bigint, messageFor: (amount: bigint) => string): AmountCheck =>
  (schema) =>
    schema.superRefine((amount, ctx) => {
      if (amount > max)
        ctx.addIssue({ code: 'custom', message: messageFor(amount) });
    });

/** the flow is off: `reason` says why; null lets everything through */
export const available =
  (reason: string | null): AmountCheck =>
  (schema) =>
    schema.refine(() => reason === null, reason ?? '');

type GasArgs = {
  /** ETH balance, gas is paid from it */
  etherBalance: bigint;
  gasCost: bigint;
  /**
   * AA / contract wallet: gas can be sponsored, so it is not checked and
   * the whole balance can be spent (with 0 ETH too, for a token)
   */
  isSmartAccount: boolean;
};

/**
 * The amount is ETH spent alongside gas: it must fit the ETH balance, and
 * leave the gas cost unless the wallet can be sponsored.
 */
export const ethWithGas =
  ({ etherBalance, gasCost, isSmartAccount }: GasArgs): AmountCheck =>
  (schema) => {
    const withBalance = schema.max(
      etherBalance,
      errorTexts.forms.general.insufficientBalance(etherBalance, 'ETH'),
    );
    if (isSmartAccount) return withBalance;

    const gasPaddedBalance = etherBalance - gasCost;
    return withBalance
      .refine(
        () => gasPaddedBalance >= 0n,
        errorTexts.forms.general.insufficientGas(gasCost),
      )
      .max(
        gasPaddedBalance,
        errorTexts.forms.general.gasReserve(gasPaddedBalance),
      );
  };

/**
 * The amount is a token (e.g. WETH) while gas is paid in ETH: the amount
 * must fit the token balance, and the ETH balance must cover the gas.
 */
export const tokenWithEthGas =
  ({
    symbol,
    balance,
    ...gas
  }: GasArgs & { symbol: string; balance: bigint }): AmountCheck =>
  (schema) => {
    const withBalance = schema.max(
      balance,
      errorTexts.forms.general.insufficientBalance(balance, symbol),
    );
    if (gas.isSmartAccount) return withBalance;
    return withBalance.refine(
      () => gas.gasCost <= gas.etherBalance,
      errorTexts.forms.general.insufficientGas(gas.gasCost),
    );
  };
