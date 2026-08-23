import { useQuery } from '@tanstack/react-query';

import { config } from 'config';
import { API_ROUTES, getApiPath } from 'consts/api';
import {
  GEO_AVAILABILITY,
  resolveGeoAvailability,
  type GeoResponse,
} from 'consts/geo';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { standardFetcher } from 'utils/standardFetcher';

// The IPFS bundle ships without /api/* routes, so there is nothing to ask —
// and with no region to trust, the fail-closed default applies: that build
// renders the limited experience for everyone.
const CAN_RESOLVE_REGION = !config.ipfsMode;

type UseGeoAvailabilityResult = GeoResponse & {
  isLimited: boolean;
  isLoading: boolean;
};

/**
 * Which experience the UI should render for the visitor's country.
 *
 * Fail-closed: `limited` holds until the route positively answers `full`, so a
 * request in flight, a failed one, and a build without the route all read as
 * limited. Render against `isLoading` rather than `isLimited` alone if the
 * screen should not settle before the answer arrives.
 *
 * A visitor's country does not change mid-session, so the query is immutable.
 */
export const useGeoAvailability = (): UseGeoAvailabilityResult => {
  const { data, isLoading } = useQuery<GeoResponse>({
    queryKey: ['geo-availability'],
    enabled: CAN_RESOLVE_REGION,
    ...STRATEGY_IMMUTABLE,
    retry: 2,
    refetchOnReconnect: true,
    queryFn: () => standardFetcher<GeoResponse>(getApiPath(API_ROUTES.GEO)),
  });

  const availability = resolveGeoAvailability(data?.availability);

  return {
    country: data?.country ?? null,
    availability,
    isLimited: availability === GEO_AVAILABILITY.limited,
    isLoading,
  };
};
