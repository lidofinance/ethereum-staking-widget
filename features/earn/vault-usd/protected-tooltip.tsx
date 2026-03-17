import { Link } from '@lidofinance/lido-ui';

export const ProtectedTooltip = () => {
  return (
    <>
      In the event of a ≥1% mark-to-market loss, dedicated protocol reserves
      absorb losses first, before user deposits.{' '}
      <Link
        href="https://research.lido.fi/t/lido-earn-competing-on-trust-5m-treasury-allocation/11228"
        target="_blank"
      >
        Learn more
      </Link>
    </>
  );
};
