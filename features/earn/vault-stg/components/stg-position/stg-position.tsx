import { parseEther } from 'viem';
import { TokenStrethIcon, TokenMellowIcon } from 'assets/earn';
import { VaultPosition } from 'features/earn/shared/vault-position';
import {
  STG_TOKEN_SYMBOL,
  MELLOW_POINT_SYMBOL,
  STG_MELLOW_POINTS_BORDER_DATE_FORMATTED,
} from '../../consts';
import { useSTGPosition } from '../../hooks/use-stg-position';
import Link from 'next/link';

const PointsTip = () => (
  <p>
    Points are <b>updated every hour</b>.
    <br />
    <span>
      <b>Before {STG_MELLOW_POINTS_BORDER_DATE_FORMATTED}:</b>
      <br />
      0.00075 points per hour per $1
    </span>
    <br />
    <span>
      <b>After {STG_MELLOW_POINTS_BORDER_DATE_FORMATTED}:</b>
      <br />
      0.00025 points per hour per $1
    </span>
    <br />
    For more information about how Mellow points work, please visit{' '}
    <Link href="https://docs.mellow.finance/points/overview">
      the Mellow website
    </Link>
  </p>
);

export const STGPosition = () => {
  const {
    data,
    mellowPoints,
    isLoading,
    usdBalance: usdAmount,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = useSTGPosition();

  // convert mellow points to the wei at 18 decimals for easier compatibility with components
  const mellowPointsBalance =
    mellowPoints && Number.isFinite(mellowPoints)
      ? parseEther(mellowPoints.toFixed(4))
      : undefined;

  return (
    <VaultPosition
      position={{
        symbol: STG_TOKEN_SYMBOL,
        token: data?.strethTokenAddress,
        balance: data?.strethSharesBalance,
        icon: <TokenStrethIcon />,
        isLoading: isLoading || isLoadingUsd,
        usdAmount,
      }}
      points={[
        {
          symbol: MELLOW_POINT_SYMBOL,
          balance: mellowPointsBalance,
          usdAmount: null,
          isLoading: isLoading,
          icon: <TokenMellowIcon />,
        },
      ]}
      pointsTip={<PointsTip />}
    />
  );
};
