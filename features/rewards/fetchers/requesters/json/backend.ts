import { dynamics } from 'config';

export type BackendQuery = {
  address: string;
  currency?: string;
  skip?: number;
  limit?: number;
  archiveRate?: boolean;
  onlyRewards?: boolean;
};

export const backendRequest = async (query: BackendQuery) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([k, v]) => params.append(k, v.toString()));

  let apiRewardsUrl;
  if (dynamics.ipfsMode) {
    apiRewardsUrl = `${dynamics.rewardsBackendBasePath}?${params.toString()}`;
  } else {
    apiRewardsUrl = `/api/rewards?${params.toString()}`;
  }

  const requested = await fetch(apiRewardsUrl);

  if (!requested.ok) {
    const responded = await requested.json();
    throw new Error(responded?.message ?? requested.statusText);
  }

  return await requested.json();
};
