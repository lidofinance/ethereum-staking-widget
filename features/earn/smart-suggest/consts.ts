import { TOKENS } from 'consts/tokens';

import { ETH_DEPOSIT_PATH, USD_DEPOSIT_PATH } from '../consts';
import type { EthDepositTokenForm } from '../vault-eth/types';
import type { UsdDepositToken } from '../vault-usd/types';

export const SMART_SUGGEST_MIN_USD = 100;

export const SMART_SUGGEST_OPEN_STORAGE_KEY = 'lido-earn-smart-suggest-open';

export const SMART_SUGGEST_APY_HINT =
  "Estimated annual yield assuming the past 14 days' average APY, after fees, continues for one year. Actual returns may vary and are not guaranteed.";

// The order of the rows in the block
export const SMART_SUGGEST_ETH_VAULT_TOKENS: readonly EthDepositTokenForm[] = [
  TOKENS.eth,
  TOKENS.weth,
  TOKENS.steth,
  TOKENS.wsteth,
];

export const SMART_SUGGEST_USD_VAULT_TOKENS: readonly UsdDepositToken[] = [
  TOKENS.usdc,
  TOKENS.usdt,
  TOKENS.usde,
];

export type SmartSuggestToken = EthDepositTokenForm | UsdDepositToken;

export type SmartSuggestVault = 'eth' | 'usd';

export const SMART_SUGGEST_DEPOSIT_PATHS: Record<SmartSuggestVault, string> = {
  eth: ETH_DEPOSIT_PATH,
  usd: USD_DEPOSIT_PATH,
};
