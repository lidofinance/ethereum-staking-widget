import type { API } from '@lidofinance/next-api-wrapper';

import { config } from 'config';
import { GEO_AVAILABILITY, type GeoResponse } from 'consts/geo';
import { getGeoAvailability } from 'utils/geo';

import { getExternalConfig } from './get-external-config';

// Cloudflare sets this on every request once IP Geolocation is enabled for the
// zone. Values are ISO 3166-1 alpha-2 plus two specials: `XX` when the address
// could not be resolved and `T1` for Tor exit nodes.
const CF_COUNTRY_HEADER = 'cf-ipcountry';
const UNRESOLVED_COUNTRY_CODES = new Set(['XX', 'T1']);

const getCountryCode = (raw: string | string[] | undefined): string | null => {
  const countryCode = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();

  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return null;
  if (UNRESOLVED_COUNTRY_CODES.has(countryCode)) return null;

  return countryCode;
};

// Without Cloudflare (local dev, test setups) the header never arrives, so
// `experience` is always `limited`. `QA_GEO_COUNTRY` stands in for it:
// - fallback, not override — a real header always wins
// - only the header is faked, the rest of the logic runs as usual
// - needs ENABLE_QA_HELPERS, which production does not set
const getQaCountryCode = (): string | null =>
  config.enableQaHelpers ? getCountryCode(config.qaGeoCountry) : null;

// Both reports fire once per process: the header is either missing on every
// request or on none of them, so logging each one is just noise.
let hasReportedUnresolvedCountry = false;
let hasReportedQaCountry = false;

// Error level, because in production a missing header means every visitor now
// gets the limited experience.
const reportUnresolvedCountry = () => {
  if (hasReportedUnresolvedCountry) return;
  hasReportedUnresolvedCountry = true;

  console.error(
    `[geoHandler] no usable "${CF_COUNTRY_HEADER}" header — requests without ` +
      'it fall back to the limited experience. Expected when the origin is ' +
      'reached directly (local dev, health probes); in production it means IP ' +
      'Geolocation is off for the Cloudflare zone',
  );
};

// Not an error: someone configured this deliberately. Still worth one line, so
// a surprising answer is traceable to the env var rather than to the edge.
const reportQaCountry = (country: string) => {
  if (hasReportedQaCountry) return;
  hasReportedQaCountry = true;

  console.info(
    `[geoHandler] no "${CF_COUNTRY_HEADER}" header — standing in for it with ` +
      `QA_GEO_COUNTRY=${country}`,
  );
};

/**
 * Handler for `/api/geo`. Tells the UI which experience to render.
 *
 * Answers availability: full only when all three are true:
 *   1. Cloudflare resolved the country (the country comes from the `cf-ipcountry` header)
 *   2. the config with the country list loaded
 *   3. the country is not on that list
 *
 * Anything else answers availability: limited.
 *
 * Without Cloudflare, `QA_GEO_COUNTRY` can stand in for step 1 — see `getQaCountryCode`.
 */
export const geoHandler: API = async (req, res) => {
  const headerCountry = getCountryCode(req.headers[CF_COUNTRY_HEADER]);
  const qaCountry = headerCountry ? null : getQaCountryCode();
  const country = headerCountry ?? qaCountry;

  if (qaCountry) reportQaCountry(qaCountry);

  if (!country) {
    reportUnresolvedCountry();
    const response: GeoResponse = {
      country: null,
      availability: GEO_AVAILABILITY.limited,
    };
    res.status(200).json(response);
    return;
  }

  let limitedCountries: string[];

  try {
    const { geo } = await getExternalConfig();
    limitedCountries = geo.limited;
  } catch (error) {
    // no list means we cannot tell whether the country is on it
    console.error(
      '[geoHandler] could not read the geo config, answering with the limited experience',
      error,
    );
    const response: GeoResponse = {
      country,
      availability: GEO_AVAILABILITY.limited,
    };
    res.status(200).json(response);
    return;
  }

  const response: GeoResponse = {
    country,
    availability: getGeoAvailability(country, limitedCountries),
  };

  res.status(200).json(response);
};
