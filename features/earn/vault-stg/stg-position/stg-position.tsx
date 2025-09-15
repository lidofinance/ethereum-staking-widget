import { TokenDvstethIcon, TokenMellowIcon } from 'assets/earn';
import { VaultPosition } from 'features/earn/shared/vault-position';
import { STG_TOKEN_SYMBOL, MELLOW_POINT_SYMBOL } from '../consts';
import { useSTGPosition as usePlaceholderPosition } from '../hooks/use-stg-position';

export const STGPosition = () => {
  const {
    data,
    usdBalance,
    isLoading: isLoadingPosition,
    usdQuery: { isLoading: isLoadingUsd } = { isLoading: false },
  } = usePlaceholderPosition() as any;

  const mellowPointsBalance = 0n;
  const isLoadingPoints = false;

  return (
    <VaultPosition
      position={{
        symbol: STG_TOKEN_SYMBOL,
        token: data?.ggvTokenAddress,
        balance: data?.sharesBalance,
        icon: <TokenDvstethIcon />,
        isLoading: isLoadingPosition || isLoadingUsd,
        usdAmount: usdBalance,
      }}
      points={[
        {
          symbol: MELLOW_POINT_SYMBOL,
          balance: mellowPointsBalance,
          usdAmount: null,
          isLoading: isLoadingPoints,
          icon: <TokenMellowIcon />,
        },
      ]}
    />
  );
};
