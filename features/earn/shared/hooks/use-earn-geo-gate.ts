import { useGeoAvailability } from 'shared/hooks/use-geo-availability';

/**
 * The single place holding the rule "new deposits are locked unless the region
 * positively answered `full`".
 *
 * Fail-closed: `isDepositGeoAvailable` stays false while the check is in
 * flight, so nothing unlocks before the answer lands.
 *
 * `isGeoUnresolved` splits the locked case in two: a country that is on the
 * limited list, and a country nothing could name at all — no Cloudflare header,
 * a failed request, a build without the route. Both lock deposits; only the
 * second is worth telling the visitor we could not verify their region.
 */
export const useEarnGeoGate = () => {
  const { isResolving, isLimited, country } = useGeoAvailability();

  return {
    isGeoChecking: isResolving,
    isGeoUnresolved: !isResolving && country === null,
    isDepositGeoAvailable: !isResolving && !isLimited,
  };
};
