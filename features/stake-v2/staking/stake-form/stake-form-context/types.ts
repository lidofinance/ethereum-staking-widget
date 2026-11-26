import type { z } from 'zod';

import type { STAKE_TOKENS_IN, STAKE_TOKENS_OUT } from './consts';
import type { stakeFormSchema } from './validation';

/** what the fields hold, e.g. `amount: bigint | null` */
export type StakeFormInputValues = z.input<typeof stakeFormSchema>;

/** what submit gets after validation, e.g. `amount: bigint` */
export type StakeFormValidatedInputValues = z.output<typeof stakeFormSchema>;

export type StakeTokenIn = (typeof STAKE_TOKENS_IN)[number];
export type StakeTokenOut = (typeof STAKE_TOKENS_OUT)[number];

export type StakeTokenOutValue = StakeFormInputValues['tokenOut'];

/** auxiliary form data, read with useStakeForm */
export type StakeFormDataContextValue = {
  /** `amount` valued in ETH; null while the field is empty */
  amountInEth: bigint | null;
};

export type StakeFormValidationContext = {
  /** every stake-out token on the supported chains */
  tokensOut: readonly StakeTokenOutValue[];
};
