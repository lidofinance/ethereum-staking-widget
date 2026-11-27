import { z } from 'zod';

import { buildFormValidationResolver, requiredAmount } from '../../../utils';
import type { StakeRouteSpec } from '../stake-routes';

import { STAKE_TOKENS_IN, STAKE_TOKENS_OUT } from './consts';
import { routableTokenOut } from './token-out';
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
  amount: requiredAmount(),
  tokenIn: tokenOnChain(STAKE_TOKENS_IN),
  tokenOut: tokenOnChain(STAKE_TOKENS_OUT),
  referral: z.string().nullable(),
});

/**
 * The stake form's resolver: the shared one, with the token pair fixed
 * first (tokenOut must be one tokenIn can stake into) and the stake routes.
 */
export const stakeFormResolver = buildFormValidationResolver<
  StakeFormInputValues,
  StakeFormValidationContext,
  StakeFormValidatedInputValues,
  StakeRouteSpec
>({
  // names the form in logs and the unknown-error toast
  formName: 'StakeForm',
  // hidden field for errors that belong to no field (wallet, network)
  fallbackField: 'referral',
  // fixes a stale pair first: tokenOut must be one tokenIn stakes into
  normalize: (values, context) => ({
    ...values,
    tokenOut: routableTokenOut(values, context.tokensOut),
  }),
  // the form's shape: what is required, and the validated types
  schema: stakeFormSchema,
  // then the picked route: its context, and its own checks
  routing: {
    getRouting: (context) => context.routing,
  },
});
