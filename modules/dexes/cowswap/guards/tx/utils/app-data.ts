import { keccak256, toHex, type Hex } from 'viem';
import { z } from 'zod';

// This is transitive dependency of @cowprotocol/widget-react, so it's version always tied to it
// eslint-disable-next-line import/no-extraneous-dependencies
import stringify from 'json-stringify-deterministic';

import { AppDataSchema } from './schemas';

export const getAppDataHex = (appData: z.infer<typeof AppDataSchema>): Hex => {
  const stringified = stringify(appData);

  const appDataHex = keccak256(toHex(stringified));

  return appDataHex;
};
