import { useQuery } from '@tanstack/react-query';

import { config, useConfig } from 'config';
import { API_ROUTES, getApiPath } from 'consts/api';
import { GEO_AVAILABILITY, type GeoResponse } from 'consts/geo';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { getGeoAvailability, resolveGeoAvailability } from 'utils/geo';
import { standardFetcher } from 'utils/standardFetcher';

// The IPFS bundle ships without /api/* routes, so there is nothing to ask —
// and with no region to trust, the fail-closed default applies: that build
// renders the limited experience for everyone.
const CAN_RESOLVE_REGION = !config.ipfsMode;

const QA_COUNTRY_KEY = 'mock-qa-helpers-geo-country';

// Pins the country per browser, for stands where the env cannot be changed and
// for testers behind Cloudflare, who cannot change the country their IP
// resolves to. Usage: `setMockGeoCountry('US')`, no argument clears it.
if (config.enableQaHelpers && typeof window !== 'undefined') {
  (window as any).setMockGeoCountry = (countryCode?: string) => {
    if (countryCode === undefined) localStorage.removeItem(QA_COUNTRY_KEY);
    else localStorage.setItem(QA_COUNTRY_KEY, countryCode);
    window.location.reload();
  };
}

// A typo is ignored rather than resolved. Read only inside `queryFn`, which is
// client-only, so server-rendered output stays identical.
const getMockedCountry = (): string | null => {
  if (!config.enableQaHelpers) return null;

  const countryCode = localStorage
    .getItem(QA_COUNTRY_KEY)
    ?.trim()
    .toUpperCase();

  return countryCode && /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
};

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
  const { geo } = useConfig().externalConfig;

  const { data, isLoading } = useQuery<GeoResponse>({
    queryKey: ['geo-availability'],
    // the QA mock lives in localStorage, so the query has to run to read it
    enabled: CAN_RESOLVE_REGION || config.enableQaHelpers,
    ...STRATEGY_IMMUTABLE,
    // failing closed means a blip costs the visitor the full experience for the
    // rest of the session, so retry a little and re-resolve on a recovered link
    retry: 2,
    refetchOnReconnect: true,
    queryFn: async (): Promise<GeoResponse> => {
      // the mock outranks everything, including a real Cloudflare header: the
      // route is never asked, the country is resolved here against the same
      // manifest list the route would have used
      const mockedCountry = getMockedCountry();
      if (mockedCountry) {
        return {
          country: mockedCountry,
          availability: getGeoAvailability(mockedCountry, geo.limited),
        };
      }

      if (!CAN_RESOLVE_REGION) {
        return { country: null, availability: GEO_AVAILABILITY.limited };
      }

      return standardFetcher<GeoResponse>(getApiPath(API_ROUTES.GEO));
    },
  });

  const availability = resolveGeoAvailability(data?.availability);

  return {
    country: data?.country ?? null,
    availability,
    isLimited: availability === GEO_AVAILABILITY.limited,
    isLoading,
  };
};
