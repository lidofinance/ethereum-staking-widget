import { getOneConfig } from 'config/one-config/utils';
const { ipfsMode, widgetApiBasePathForIpfs } = getOneConfig();

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

  const apiRewardsPath = `/api/rewards?${params.toString()}`;
  const apiRewardsUrl = ipfsMode
    ? `${widgetApiBasePathForIpfs}${apiRewardsPath}`
    : apiRewardsPath;
  const requested = await fetch(apiRewardsUrl);

  if (!requested.ok) {
    const responded = await requested.json();
    throw new Error(responded?.message ?? requested.statusText);
  }

  return await requested.json();
};
