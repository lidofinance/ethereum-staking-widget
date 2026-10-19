import { TokenStrethIcon, TokenMellowIcon } from 'assets/earn';
import { VaultPosition } from 'features/earn/shared/vault-position';
import { STG_TOKEN_SYMBOL, MELLOW_POINT_SYMBOL } from '../../consts';
import { useSTGPosition } from '../../hooks/use-stg-position';
import Link from 'next/link';

const PointsTip = () => (
  <p>
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
          balance: mellowPoints,
          usdAmount: null,
          isLoading: isLoading,
          icon: <TokenMellowIcon />,
        },
      ]}
      pointsTip={<PointsTip />}
    />
  );
};
