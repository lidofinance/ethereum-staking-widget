import { FC } from 'react';
import {
  LimitsError,
  NoStEthError,
  NetworkError,
} from 'features/rewards/components/Errors';

import { RewardsListErrorMessageProps } from './types';

export const RewardsListErrorMessage: FC<RewardsListErrorMessageProps> = ({
  errorMessage,
}) => {
  return (
    <>
      {errorMessage === 'Subgraph limits are hit.' ? (
        <LimitsError />
      ) : errorMessage === 'Address never had stETH.' ? (
        <NoStEthError />
      ) : (
        <NetworkError />
      )}
    </>
  );
};
