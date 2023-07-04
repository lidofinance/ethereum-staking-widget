import { FC, createContext, useContext, useMemo, useState } from 'react';
import { Steth, Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import invariant from 'tiny-invariant';

import { StatusProps } from 'features/withdrawals/shared/status';

import { useContractStatus } from './useContractStatus';

export const iconsMap = {
  [TOKENS.WSTETH]: <Wsteth />,
  [TOKENS.STETH]: <Steth />,
};

export type WithdrawalsContextValue = {
  selectedToken: keyof typeof iconsMap;
  setSelectedToken: (token: keyof typeof iconsMap) => void;
  isSteth: boolean;
  isClaimTab: boolean;
  withdrawalsStatus: StatusProps['variant'];
  isWithdrawalsStatusLoading: boolean;
  isPaused?: boolean;
  isTurbo?: boolean;
  isBunker?: boolean;
};
const WithdrawalsContext = createContext<WithdrawalsContextValue | null>(null);
WithdrawalsContext.displayName = 'WithdrawalsContext';

export const useWithdrawals = () => {
  const value = useContext(WithdrawalsContext);
  invariant(value, 'useWithdrawals was used outside WithdrawalContext');
  return value;
};

type WithdrawalsProviderProps = {
  mode: 'request' | 'claim';
};

export const WithdrawalsProvider: FC<WithdrawalsProviderProps> = ({
  children,
  mode,
}) => {
  const [selectedToken, setSelectedToken] = useState<
    TOKENS.WSTETH | TOKENS.STETH
  >(TOKENS.STETH);

  const {
    withdrawalsStatus,
    isWithdrawalsStatusLoading,
    isPaused,
    isBunker,
    isTurbo,
  } = useContractStatus();

  const isClaimTab = mode === 'claim';
  const isSteth = selectedToken === TOKENS.STETH;

  const value = useMemo(
    () => ({
      selectedToken,
      setSelectedToken,
      isSteth,
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      isPaused,
      isTurbo,
      isBunker,
    }),
    [
      selectedToken,
      isSteth,
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      isPaused,
      isTurbo,
      isBunker,
    ],
  );

  return (
    <WithdrawalsContext.Provider value={value}>
      {children}
    </WithdrawalsContext.Provider>
  );
};
