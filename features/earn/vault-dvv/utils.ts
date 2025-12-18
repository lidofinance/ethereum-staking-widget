import { standardFetcher } from 'utils/standardFetcher';
import { APY_SCHEMA } from 'utils/zod';
import { MellowAPIResponse } from './hooks/use-dvv-stats';
import { DVV_APR_ENDPOINT } from './consts';

export const fetchDVVStats = async () => {
  const data = await standardFetcher<MellowAPIResponse>(DVV_APR_ENDPOINT);

  const dvstETHVault = data.find((vault) => vault.id === 'ethereum-dvsteth');

  return dvstETHVault;
};

export const fetchDVVStatsApr = async () => {
  const data = await fetchDVVStats();
  const apr = APY_SCHEMA.parse(data?.apr);
  return apr;
};

export const fetchDVVStatsAprBreakdown = async () => {
  const data = await fetchDVVStats();
  const apr = APY_SCHEMA.parse(data?.apr);
  // TODO: validate
  const aprBreakdown = data?.apr_breakdown || [];

  return {
    apr,
    aprBreakdown,
  };
};
