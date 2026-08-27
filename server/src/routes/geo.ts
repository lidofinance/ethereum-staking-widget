import type { FastifyPluginAsync } from 'fastify';

import { GEO_AVAILABILITY, type GeoResponse } from 'consts/geo';
import { getGeoAvailability } from 'utils/geo';

import { config } from '../config.js';
import {
  applyCacheControl,
  CACHE_GEO_HEADERS,
} from '../utils/cache-control.js';
import { getExternalManifestConfig } from '../utils/external-manifest.js';
import { maskedError } from '../utils/masked-error.js';
import { ROUTES } from '../consts.js';

/**
 * `/api/geo` — tells the UI which experience to render. Port of
 * `utilsApi/geo-handler.ts` + `pages/api/geo.ts` from develop.
 *
 * Answers availability `full` only when all three are true:
 *   1. Cloudflare resolved the country (the `cf-ipcountry` header)
 *   2. the config with the country list loaded
 *   3. the country is not on that list
 *
 * Anything else answers availability `limited` (fail-closed).
 *
 * Without Cloudflare, `QA_GEO_COUNTRY` can stand in for step 1 — see
 * `getQaCountryCode`.
 *
 * NO `allowAnyOrigin` here, unlike rewards / validation / earn. Those serve
 * public data; this one answers with the caller's own country. Without an
 * `Access-Control-Allow-Origin` header the browser lets only our own pages
 * read the answer, so another site cannot fetch it from a visitor's browser
 * to learn where they are. Embedding still works: inside an iframe the page
 * origin is still ours.
 */

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
  config.ENABLE_QA_HELPERS ? getCountryCode(config.QA_GEO_COUNTRY) : null;

// Port of the manifest `GeoCountryListSchema` semantics
// (config/external-config/validate.ts): unrecognised entries are dropped
// rather than failing the whole list, the rest is trimmed, uppercased and
// deduped. A missing block means "no limited countries" (the schema default);
// `null` means the block is present but unreadable — the caller answers
// limited then (the frontend schema would fall back to the bundled manifest
// here; the server reads the manifest loosely, so it takes the conservative
// branch instead).
const readLimitedCountries = (geo: unknown): string[] | null => {
  if (geo === undefined || geo === null) return [];
  if (typeof geo !== 'object' || Array.isArray(geo)) return null;

  const { limited } = geo as { limited?: unknown };
  if (limited === undefined) return [];
  if (!Array.isArray(limited)) return null;

  return [
    ...new Set(
      limited
        .filter(
          (code): code is string =>
            typeof code === 'string' && /^[A-Za-z]{2}$/.test(code.trim()),
        )
        .map((code) => code.trim().toUpperCase()),
    ),
  ];
};

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
    `[geo] no usable "${CF_COUNTRY_HEADER}" header — requests without ` +
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
    `[geo] no "${CF_COUNTRY_HEADER}" header — standing in for it with ` +
      `QA_GEO_COUNTRY=${country}`,
  );
};

export const geoRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get(ROUTES.api.geo, async (req, reply) => {
    // per-visitor answer — must never land in a shared cache
    applyCacheControl(reply, CACHE_GEO_HEADERS);

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
      return response;
    }

    let limitedCountries: string[] | null;

    try {
      const manifestConfig = await getExternalManifestConfig();
      // no manifest entry at all → cannot tell → limited; a present entry
      // without a geo block → no limited countries (schema-default parity)
      limitedCountries = manifestConfig
        ? readLimitedCountries(manifestConfig.geo)
        : null;
    } catch (error) {
      console.error('[geo] could not read the manifest', maskedError(error));
      limitedCountries = null;
    }

    if (limitedCountries === null) {
      // no list means we cannot tell whether the country is on it
      console.error(
        '[geo] could not read the geo config, answering with the limited experience',
      );
      const response: GeoResponse = {
        country,
        availability: GEO_AVAILABILITY.limited,
      };
      return response;
    }

    const response: GeoResponse = {
      country,
      availability: getGeoAvailability(country, limitedCountries),
    };
    return response;
  });
};
