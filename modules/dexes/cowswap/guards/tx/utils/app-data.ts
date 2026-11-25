import { keccak256, toHex, type Hex } from 'viem';

// This is transitive dependency of @cowprotocol/widget-react, so it's version always tied to it
// eslint-disable-next-line import/no-extraneous-dependencies
import stringify from 'json-stringify-deterministic';

import type { AppData } from './types';

export const getAppDataHex = (appData: AppData): Hex => {
  const stringified = stringify(appData);

  const appDataHex = keccak256(toHex(stringified));

  return appDataHex;
};
