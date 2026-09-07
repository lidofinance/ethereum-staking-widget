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

export type GeoNoticeState =
  'checking' | 'checking-slow' | 'limited' | 'unresolved';

type GetGeoNoticeStateArgs = {
  /** the region is not resolved yet — the browser has not asked, or is asking */
  isChecking: boolean;
  isSlow: boolean;
  isLimited: boolean;
  /** the check finished without a country — the region could not be verified */
  isUnresolved: boolean;
  /** withdraw stays available in a limited region, so only deposit surfaces it */
  showLimitedNotice: boolean;
};

/**
 * Which region notice a vault page shows, if any.
 */
export const getGeoNoticeState = ({
  isChecking,
  isSlow,
  isLimited,
  isUnresolved,
  showLimitedNotice,
}: GetGeoNoticeStateArgs): GeoNoticeState | null => {
  // `isLimited` is fail-closed, so it is already true while the check runs —
  // the checking copy has to win until the answer actually lands
  if (isChecking) return isSlow ? 'checking-slow' : 'checking';
  if (!showLimitedNotice) return null;
  // an unverified region is locked the same way, but it is not a verdict about
  // the visitor's country, so it gets its own copy
  if (isUnresolved) return 'unresolved';
  if (isLimited) return 'limited';
  return null;
};
