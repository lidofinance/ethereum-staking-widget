import { FC, createContext, useMemo, useState } from 'react';
import { Steth, Wsteth } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';

import { StatusProps } from 'features/withdrawals/shared/status';

import { useContractStatus } from './useContractStatus';
import { useRoutes } from './useRoutes';

export const WithdrawalsContext = createContext({} as WithdrawalsValue);

export const iconsMap = {
  [TOKENS.WSTETH]: <Wsteth />,
  [TOKENS.STETH]: <Steth />,
};

export type WithdrawalsValue = {
  selectedToken: keyof typeof iconsMap;
  setSelectedToken: (token: keyof typeof iconsMap) => void;
  isSteth: boolean;
  isClaimTab: boolean;
  withdrawalsStatus: StatusProps['variant'];
  isWthdrawalsStatusLoading: boolean;
  claimPath: string;
  requestPath: string;
  isPaused: boolean;
  isBunkerMode: boolean;
  navRoutes: ReturnType<typeof useRoutes>['navRoutes'];
};

const WithdrawalsProvider: FC = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<
    TOKENS.WSTETH | TOKENS.STETH
  >(TOKENS.STETH);

  const {
    withdrawalsStatus,
    isWthdrawalsStatusLoading,
    isPaused,
    isBunkerMode,
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
      isWthdrawalsStatusLoading,
      claimPath,
      isPaused,
      isBunkerMode,
      requestPath,
      navRoutes,
    }),
    [
      selectedToken,
      isSteth,
      isClaimTab,
      withdrawalsStatus,
      isWthdrawalsStatusLoading,
      claimPath,
      isPaused,
      isBunkerMode,
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

export default WithdrawalsProvider;
