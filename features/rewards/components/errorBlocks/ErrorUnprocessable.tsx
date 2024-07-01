import Link from 'next/link';
import { ErrorBlockBase } from './ErrorBlockBase';

export const ErrorUnprocessable = () => (
  <ErrorBlockBase
    textProps={{ color: 'error' }}
    text={
      <>
        This address has reached limit for parsed stETH transfers. Fetch rewards
        directly from Lido Subgraph using{' '}
        <Link
          href={
            'https://lidofinance.github.io/lido-ethereum-sdk/methods/rewards/#get-rewards-from-subgraph'
          }
        >
          Rewards Module from Lido Ethereum SDK
        </Link>
        .
      </>
    }
  />
);
