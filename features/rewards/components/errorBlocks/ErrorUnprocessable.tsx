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
            'https://lidofinance.github.io/lido-ethereum-sdk/methods/rewards/#get-rewards-from-subgraph'
          }
        >
          Rewards Module from Lido Ethereum SDK
        </Link>{' '}
        and fetch rewards from subgraph directly
      </>
    }
  />
);
