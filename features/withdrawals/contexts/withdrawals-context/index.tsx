import { FC, createContext, useContext, useMemo, useState } from 'react';
import { Steth, Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import invariant from 'tiny-invariant';

import { StatusProps } from 'features/withdrawals/shared/status';

import { useContractStatus } from './useContractStatus';
import { useRoutes } from './useRoutes';

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
  claimPath: string;
  requestPath: string;
  isPaused?: boolean;
  isTurbo?: boolean;
  isBunker?: boolean;
  navRoutes: ReturnType<typeof useRoutes>['navRoutes'];
};
const WithdrawalsContext = createContext<WithdrawalsContextValue | null>(null);
WithdrawalsContext.displayName = 'WithdrawalsContext';

export const useWithdrawals = () => {
  const value = useContext(WithdrawalsContext);
  invariant(value, 'useWithdrawals was used outside WithdrawalContext');
  return value;
};

export const WithdrawalsProvider: FC = ({ children }) => {
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
  const { isClaimTab, navRoutes, claimPath, requestPath } = useRoutes();

  const isSteth = selectedToken === TOKENS.STETH;

  const value = useMemo(
    () => ({
      selectedToken,
      setSelectedToken,
      isSteth,
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      claimPath,
      isPaused,
      isTurbo,
      isBunker,
      requestPath,
      navRoutes,
    }),
    [
      selectedToken,
      isSteth,
      isClaimTab,
      withdrawalsStatus,
      isWithdrawalsStatusLoading,
      claimPath,
      isPaused,
      isTurbo,
      isBunker,
      requestPath,
      navRoutes,
    ],
  );

  return (
    <WithdrawalsContext.Provider value={value}>
      {children}
    </WithdrawalsContext.Provider>
  );
};
