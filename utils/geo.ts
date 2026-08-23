import { GEO_AVAILABILITY, type GeoAvailability } from 'consts/geo';

/**
 * Narrows an untrusted value to an availability, fail-closed: only a literal
 * `full` yields the full experience. Takes `unknown` on purpose — the API
 * response is parsed JSON that nothing has validated, so a truncated or
 * unexpected body has to land on `limited` rather than be trusted.
 */
export const resolveGeoAvailability = (value: unknown): GeoAvailability =>
  value === GEO_AVAILABILITY.full
    ? GEO_AVAILABILITY.full
    : GEO_AVAILABILITY.limited;

/**
 * The one place that decides whether a country gets the limited experience.
 * Shared by `/api/geo` and the QA mock in the client hook, so both answer the
 * same way. The schema already uppercases the list; compared defensively in
 * case that ever changes.
 */
export const getGeoAvailability = (
  country: string,
  limitedCountries: string[],
): GeoAvailability =>
  limitedCountries.some((code) => code.toUpperCase() === country.toUpperCase())
    ? GEO_AVAILABILITY.limited
    : GEO_AVAILABILITY.full;
