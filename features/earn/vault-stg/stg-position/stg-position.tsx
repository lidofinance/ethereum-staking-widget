import { parseEther } from 'viem';
import { TokenStrethIcon, TokenMellowIcon } from 'assets/earn';
import { VaultPosition } from 'features/earn/shared/vault-position';
import { STG_TOKEN_SYMBOL, MELLOW_POINT_SYMBOL } from '../consts';
import { useSTGPosition } from '../hooks/use-stg-position';

export const STGPosition = () => {
  const {
    data,
    mellowPoints,
    isLoading,
    usdBalance: usdAmount,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = useSTGPosition();

  // convert mellow points to the wei at 18 decimals for easier compatibility with components
  const mellowPointsBalance = parseEther(mellowPoints.toFixed(4) ?? '0');

  return (
    <VaultPosition
      position={{
        symbol: STG_TOKEN_SYMBOL,
        token: data?.strethTokenAddress,
        balance: data?.sharesBalance,
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
    />
  );
};
