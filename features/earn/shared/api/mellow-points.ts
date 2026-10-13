import { z } from 'zod';
import { isAddressEqual, type Address } from 'viem';

import {
  ADDRESS_SCHEMA,
  BIGINT_STRING_SCHEMA,
  TOKEN_DECIMALS_SCHEMA,
  decimalToUnitsSchema,
} from 'utils/zod';

// Points arrive as decimal strings; converted to wei at 18 decimals right here
const MELLOW_POINTS_SCHEMA = decimalToUnitsSchema(18);

// Only the fields the widget reads are validated, the rest passes through
const MELLOW_USER_POINTS_RESPONSE_SCHEMA = z.array(
  z.looseObject({ vault_address: ADDRESS_SCHEMA }),
);

export const MELLOW_CLAIM_REWARD_SCHEMA = z.looseObject({
  claimable_amount: BIGINT_STRING_SCHEMA,
  claimed_amount: BIGINT_STRING_SCHEMA,
  token: z.looseObject({
    address: ADDRESS_SCHEMA,
    decimals: TOKEN_DECIMALS_SCHEMA,
    price: z.number().min(0),
  }),
});

const MELLOW_CLAIM_RESPONSE_SCHEMA = z.object({
  vaults: z.array(
    z.looseObject({ vault: ADDRESS_SCHEMA, rewards: z.array(z.unknown()) }),
  ),
});

export type MellowClaimReward = z.infer<typeof MELLOW_CLAIM_REWARD_SCHEMA>;

/**
 * Validated Mellow points of `vault` for the user, as wei at 18 decimals so
 * components never parse them. A missing record means a new user with 0 points.
 */
export const getMellowUserPointsWei = (data: unknown, vault: Address) => {
  const record = MELLOW_USER_POINTS_RESPONSE_SCHEMA.parse(data).find((item) =>
    isAddressEqual(item.vault_address, vault),
  );

  return record ? MELLOW_POINTS_SCHEMA.parse(record.user_mellow_points) : 0n;
};

/** First validated claim reward of `vault`; undefined when the user has none. */
export const getMellowClaimReward = (data: unknown, vault: Address) => {
  const reward = MELLOW_CLAIM_RESPONSE_SCHEMA.parse(data).vaults.find((item) =>
    isAddressEqual(item.vault, vault),
  )?.rewards[0];

  return reward === undefined
    ? undefined
    : MELLOW_CLAIM_REWARD_SCHEMA.parse(reward);
};
