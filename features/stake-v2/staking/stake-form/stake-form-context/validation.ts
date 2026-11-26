import type { Resolver } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  ValidationError,
  handleResolverValidationError,
} from 'shared/hook-form/validation/validation-error';

import { STAKE_TOKENS_IN, STAKE_TOKENS_OUT } from './consts';
import { adjustTokenOut, getTokenOutList } from './token-out';
import type {
  StakeFormInputValues,
  StakeFormValidatedInputValues,
  StakeFormValidationContext,
} from './types';

// a token on a given chain: the form spans every supported chain at once
// no `const` type parameter: the Babel build cannot parse it; the callers
// pass `as const` tuples, so the token ids stay literal anyway
const tokenOnChain = <T extends readonly [string, ...string[]]>(tokens: T) =>
  z.object({
    // token id, as `token` of useTokenList; the display symbol is not stored
    token: z.enum(tokens),
    chainId: z.number().int().positive(),
  });

/**
 * Shape of the form and the source of its types; the checks are still
 * to come. Input and output differ: `amount` is null while the field is
 * empty and a bigint once validated.
 */
export const stakeFormSchema = z.object({
  amount: z
    .bigint()
    .nullable()
    .transform((amount, ctx) => {
      if (amount === null) {
        ctx.addIssue({ code: 'custom', message: 'Enter amount' });
        return z.NEVER;
      }
      return amount;
    }),
  tokenIn: tokenOnChain(STAKE_TOKENS_IN),
  tokenOut: tokenOnChain(STAKE_TOKENS_OUT),
  referral: z.string().nullable(),
});

export const stakeFormResolver: Resolver<
  StakeFormInputValues,
  StakeFormValidationContext,
  StakeFormValidatedInputValues
> = async (values, context) => {
  try {
    invariant(context, 'validation context is required');

    // 1. fix what the UI has not caught up with yet: submit gets the
    // resolver's values, so the fixed ones are what gets staked
    const fixed: StakeFormInputValues = {
      ...values,
      tokenOut: adjustTokenOut(
        values.tokenOut,
        getTokenOutList(values.tokenIn, context.tokensOut),
      ),
    };

    // 2. the schema
    const result = stakeFormSchema.safeParse(fixed);
    if (!result.success) {
      const [issue] = result.error.issues;
      throw new ValidationError(
        String(issue?.path[0] ?? 'referral'),
        issue?.message ?? 'Invalid value',
      );
    }

    return { values: result.data, errors: {} };
  } catch (error) {
    return handleResolverValidationError(error, 'StakeForm', 'referral');
  }
};
