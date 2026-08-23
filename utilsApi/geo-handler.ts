import type { API } from '@lidofinance/next-api-wrapper';

import { GEO_AVAILABILITY, type GeoResponse } from 'consts/geo';

import { getExternalConfig } from './get-external-config';

// Cloudflare sets this on every request once IP Geolocation is enabled for the
// zone. Values are ISO 3166-1 alpha-2 plus two specials: `XX` when the address
// could not be resolved and `T1` for Tor exit nodes.
const CF_COUNTRY_HEADER = 'cf-ipcountry';
const UNRESOLVED_COUNTRY_CODES = new Set(['XX', 'T1']);

const readCountry = (raw: string | string[] | undefined): string | null => {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();

  if (!value || !/^[A-Z]{2}$/.test(value)) return null;
  if (UNRESOLVED_COUNTRY_CODES.has(value)) return null;

  return value;
};

// Log once per process: the header is either missing on every request or on
// none of them, so logging each one is just noise. Error level, because in
// production it means every visitor now gets the limited experience.
let hasReportedUnresolvedCountry = false;

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

/**
 * Handler for `/api/geo`. Tells the UI which experience to render.
 *
 * Answers availability: full only when all three are true:
 *   1. Cloudflare resolved the country (the country comes from the `cf-ipcountry` header)
 *   2. the config with the country list loaded
 *   3. the country is not on that list
 *
 * Anything else answers availability: limited.
 */
export const geoHandler: API = async (req, res) => {
  const country = readCountry(req.headers[CF_COUNTRY_HEADER]);

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

  // the schema already uppercases the list, but compare case-insensitively
  // anyway so this keeps working if that ever changes
  const isListed = limitedCountries.some(
    (code) => code.toUpperCase() === country,
  );

  const response: GeoResponse = {
    country,
    availability: isListed ? GEO_AVAILABILITY.limited : GEO_AVAILABILITY.full,
  };

  res.status(200).json(response);
};
