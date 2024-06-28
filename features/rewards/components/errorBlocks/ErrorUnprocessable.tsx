import Link from 'next/link';
import { ErrorBlockBase } from './ErrorBlockBase';

export const ErrorUnprocessable = () => (
  <ErrorBlockBase
    textProps={{ color: 'error' }}
    text={
      <>
        This address has too many stETH transfers. For querying such addresses
        use{' '}
        <Link
          href={
            'https://github.com/lidofinance/lido-ethereum-sdk/blob/main/packages/sdk/README.md#rewards'
          }
        >
          Rewards Module from Lido Ethereum SDK
        </Link>{' '}
        and fetch rewards from subgraph directly
      </>
    }
  />
);
