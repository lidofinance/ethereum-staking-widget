import { useQuery } from '@tanstack/react-query';

import { config, useConfig } from 'config';
import { API_ROUTES, getApiPath } from 'consts/api';
import { GEO_AVAILABILITY, type GeoResponse } from 'consts/geo';
import { QA_KEYS } from 'consts/qa-keys';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { getGeoAvailability, resolveGeoAvailability } from 'utils/geo';
import { standardFetcher } from 'utils/standardFetcher';

// The IPFS bundle ships without /api/* routes, so there is nothing to ask —
// and with no region to trust, the fail-closed default applies: that build
// renders the limited experience for everyone.
const CAN_RESOLVE_REGION = !config.ipfsMode;

const QA_COUNTRY_KEY = QA_KEYS.geoCountry;

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

// the QA mock lives in localStorage, so the query has to run to read it
const IS_QUERY_ENABLED = CAN_RESOLVE_REGION || config.enableQaHelpers;

type UseGeoAvailabilityResult = GeoResponse & {
  isLimited: boolean;
  isResolving: boolean;
};

/**
 * Which experience the UI should render for the visitor's country.
 *
 * Fail-closed: `limited` holds until the route positively answers `full`, so a
 * request in flight, a failed one, and a build without the route all read as
 * limited. Render against `isResolving` rather than `isLimited` alone if the
 * screen should not settle before the answer arrives.
 *
 * `isResolving` covers both "the browser has not asked yet" and "the request is
 * in flight", which is what a statically rendered page needs: the prerendered
 * HTML must not claim the region is limited before anyone has asked, or it
 * flashes that claim at every visitor and mismatches on hydration. A build that
 * never asks is not resolving — it is already answered, fail-closed.
 *
 * A visitor's country does not change mid-session, so the query is immutable —
 * the answer survives client-side navigation between earn pages.
 */
export const useGeoAvailability = (): UseGeoAvailabilityResult => {
  const { geo } = useConfig().externalConfig;

  const { data, isPending } = useQuery<GeoResponse>({
    queryKey: ['geo-availability'],
    enabled: IS_QUERY_ENABLED,
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
    isResolving: IS_QUERY_ENABLED && isPending,
  };
};
