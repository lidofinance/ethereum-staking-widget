import { Link } from '@lidofinance/lido-ui';

export const ProtectedTooltip = () => {
  return (
    <>
      Vault deposits are protected by two layers: Firelight absorbs eligible and
      approved losses first, up to 8% of TVL for each 30-day period, subject{' '}
      <Link
        href="https://docs.firelight.finance/resources/cover-scope"
        target="_blank"
      >
        to the applicable terms and conditions
      </Link>
      . Any remaining loss can then be absorbed by the Lido DAO&apos;s loss
      protection mechanism, applicable to this vault, and subject{' '}
      <Link
        href="https://snapshot.box/#/s:lido-snapshot.eth/proposal/0xd32eab4ce41e2754d8a51fdf89bd9f4eb43ecbeb7b60d0e93ce84bc3e4d4c8a3"
        target="_blank"
      >
        to the applicable terms and conditions
      </Link>{' '}
      (initial deposit of $2M in USDC, currently ~$2.1M). Deposits are not
      protected from any and all loss.
    </>
  );
};
