import { FC, createContext, useCallback, useContext, useMemo } from 'react';
import {
  SWRResponse,
  useSTETHBalance,
  useWSTETHBalance,
} from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import invariant from 'tiny-invariant';

import { useUnfinalizedStETH } from 'features/withdrawals/hooks';
import { useClaimData } from 'features/withdrawals/contexts/claim-data-context';

import {
  useRequestOptions,
  RequestOption,
  RequestTypes,
} from './useRequestOptions';

export type RequestDataContextValue = {
  stethBalance: SWRResponse<BigNumber>;
  wstethBalance: SWRResponse<BigNumber>;
  updateData: () => void;
  isLidoRequest?: boolean;
  currentRequestType?: RequestOption;
  onChangeRequestOptions: (claimType: RequestTypes) => void;
  requestOptions: RequestOption[];
  unfinalizedStETH: SWRResponse<BigNumber, Error>;
};
const RequestDataContext = createContext<RequestDataContextValue | null>(null);
RequestDataContext.displayName = 'RequestDataContext';

export const useRequestData = () => {
  const value = useContext(RequestDataContext);
  invariant(value, 'useRequestData was used outside RequestDataContext');
  return value;
};

export const RequestDataProvider: FC = ({ children }) => {
  const { update: withdrawalRequestsDataUpdate } = useClaimData();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();
  const unfinalizedStETH = useUnfinalizedStETH();

  const {
    requestOptions,
    onChangeRequestOptions,
    isLidoRequest,
    currentRequestType,
  } = useRequestOptions();

  const updateData = useCallback(() => {
    // TODO
    stethBalance.update();
    wstethBalance.update();
    withdrawalRequestsDataUpdate();
    unfinalizedStETH.update();
  }, [
    stethBalance,
    unfinalizedStETH,
    withdrawalRequestsDataUpdate,
    wstethBalance,
  ]);

  const value = useMemo(
    () => ({
      stethBalance,
      wstethBalance,
      updateData,
      requestOptions,
      onChangeRequestOptions,
      isLidoRequest,
      currentRequestType,
      unfinalizedStETH,
    }),
    [
      currentRequestType,
      isLidoRequest,
      onChangeRequestOptions,
      requestOptions,
      stethBalance,
      updateData,
      wstethBalance,
      unfinalizedStETH,
    ],
  );

  return (
    <RequestDataContext.Provider value={value}>
      {children}
    </RequestDataContext.Provider>
  );
};
