import { Link } from '@lidofinance/lido-ui';
import { config } from 'config';

export const ProtectedTooltip = () => {
  return (
    <>
      In the event of a ≥1% mark-to-market loss, dedicated protocol reserves
      absorb losses first, before user deposits.{' '}
      <Link
        href={`${config.researchOrigin}/t/lido-earn-competing-on-trust-5m-treasury-allocation/11228`}
        target="_blank"
      >
        Learn more
      </Link>
    </>
  );
};
