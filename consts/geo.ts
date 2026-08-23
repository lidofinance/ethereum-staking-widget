/**
 * Contract shared by `/api/geo` and its client hook.
 *
 * The wording is deliberately neutral: the API reports which *experience* a
 * visitor gets, not a verdict about them.
 *
 * The resolution is fail-closed. `limited` is the default, and `full` is only
 * ever reached by positively establishing a trusted region: the edge resolved
 * the country, the config that names the limited regions was readable, and the
 * country is not among them. Every other path — no Cloudflare header, an
 * unreachable route, a malformed body, a build with no API at all — ends at
 * `limited`. The functions that do the resolving live in `utils/geo`.
 */

export const GEO_AVAILABILITY = {
  full: 'full',
  limited: 'limited',
} as const;

export type GeoAvailability =
  (typeof GEO_AVAILABILITY)[keyof typeof GEO_AVAILABILITY];

export type GeoResponse = {
  /** ISO 3166-1 alpha-2, or `null` when the country could not be resolved. */
  country: string | null;
  availability: GeoAvailability;
};
