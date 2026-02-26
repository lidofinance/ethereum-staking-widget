import * as z from 'zod';
import { CHAINS } from 'consts/chains';
import { getContractAddress } from 'config/networks/contract-address';
import { standardFetcher } from 'utils/standardFetcher';
import { UNIX_TIMESTAMP_SCHEMA, PERCENT_SCHEMA, APY_SCHEMA } from 'utils/zod';
import { USD_VAULT_STATS_ORIGIN } from './consts';
import { TokenSymbol } from 'consts/tokens';
import { UsdDepositToken } from './types';
import { asToken } from 'utils/as-token';

export const ALLOCATION_SCHEMA = z.array(
  z.object({
    id: z.string(),
    label: z.string(),
    sharePercent: PERCENT_SCHEMA,
    tvl: z.object({
      amount: z.string(),
      asset: z.string(),
      decimals: z.number(),
    }),
    chain: z.string(),
  }),
);
export const USD_VAULT_STATS_SCHEMA = z.object({
  allocations: ALLOCATION_SCHEMA,
  lastUpdate: UNIX_TIMESTAMP_SCHEMA,
});

export type UsdVaultStatsFetchedData = z.infer<typeof USD_VAULT_STATS_SCHEMA>;

export const USD_VAULT_APY_SCHEMA = z.object({
  apy: APY_SCHEMA,
});
export type UsdVaultApyFetchedData = z.infer<typeof USD_VAULT_APY_SCHEMA>;

export const fetchUsdVaultStats = async () => {
  const usdVaultAddress = getContractAddress(CHAINS.Mainnet, 'usdVault');
  const USD_STATS_ENDPOINT = `${USD_VAULT_STATS_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${usdVaultAddress}/data`;

  const data =
    await standardFetcher<UsdVaultStatsFetchedData>(USD_STATS_ENDPOINT);
  const stats = USD_VAULT_STATS_SCHEMA.parse(data);
  return stats;
};

export const fetchUsdVaultStatsApr = async () => {
  const usdVaultAddress = getContractAddress(CHAINS.Mainnet, 'usdVault');
  const USD_APY_ENDPOINT = `${USD_VAULT_STATS_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${usdVaultAddress}/apy`;

  const data = await standardFetcher<UsdVaultApyFetchedData>(USD_APY_ENDPOINT);
  const apy = USD_VAULT_APY_SCHEMA.parse(data).apy;
  return apy;
};

// Converts a case sensitive TokenSymbol to an UsdDepositToken which must be lowercase.
// This is needed because the form values use TokenSymbol which can be uppercase,
// but some functions expects UsdDepositToken which is lowercase.
export const asUsdDepositToken = (token: TokenSymbol) => {
  return asToken<UsdDepositToken>(token);
};
