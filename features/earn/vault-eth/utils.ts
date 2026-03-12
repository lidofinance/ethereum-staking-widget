import * as z from 'zod';
import { CHAINS } from 'consts/chains';
import { getContractAddress } from 'config/networks/contract-address';
import { standardFetcher } from 'utils/standardFetcher';
import type { TokenSymbol } from 'consts/tokens';
import { asToken } from 'utils/as-token';
import { UNIX_TIMESTAMP_SCHEMA, PERCENT_SCHEMA, APY_SCHEMA } from 'utils/zod';
import { ETH_VAULT_STATS_ORIGIN } from './consts';
import type { EthDepositToken } from './types';

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
export const ETH_VAULT_STATS_SCHEMA = z.object({
  allocations: ALLOCATION_SCHEMA,
  lastUpdate: UNIX_TIMESTAMP_SCHEMA,
  totalTvl: z.object({
    usd: z.string(),
    usd_decimals: z.number(),
  }),
});

export type EthVaultStatsFetchedData = z.infer<typeof ETH_VAULT_STATS_SCHEMA>;

export const ETH_VAULT_APY_SCHEMA = z.object({
  apy: APY_SCHEMA,
});
export type EthVaultApyFetchedData = z.infer<typeof ETH_VAULT_APY_SCHEMA>;

export const fetchEthVaultStats = async () => {
  const ethVaultAddress = getContractAddress(CHAINS.Mainnet, 'ethVault');
  const ETH_STATS_ENDPOINT = `${ETH_VAULT_STATS_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${ethVaultAddress}/data`;

  const data =
    await standardFetcher<EthVaultStatsFetchedData>(ETH_STATS_ENDPOINT);
  const stats = ETH_VAULT_STATS_SCHEMA.parse(data);
  return stats;
};

export const fetchEthVaultStatsApr = async () => {
  const ethVaultAddress = getContractAddress(CHAINS.Mainnet, 'ethVault');
  const ETH_APY_ENDPOINT = `${ETH_VAULT_STATS_ORIGIN}/v1/chain/${CHAINS.Mainnet}/core-vaults/${ethVaultAddress}/apy`;

  const data = await standardFetcher<EthVaultApyFetchedData>(ETH_APY_ENDPOINT);
  const apy = ETH_VAULT_APY_SCHEMA.parse(data).apy;
  return apy;
};

// Converts a case sensitive TokenSymbol to an EthDepositToken which must be lowercase.
// This is needed because the form values use TokenSymbol which can be uppercase,
// but some functions expects EthDepositToken which is lowercase.
export const asEthDepositToken = (token: TokenSymbol) => {
  return asToken<EthDepositToken>(token);
};
