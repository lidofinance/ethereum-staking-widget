import { FC } from 'react';

import { StEthBalanceBlock } from './steth-balance-block';
import { StEthRewardedBlock } from './steth-rewarded-block';
import { AverageAprBlock } from './average-apr-block';
import { StEthPriceBlock } from './steth-price-block';

export const Stats: FC = () => {
  return (
    <>
      <StEthBalanceBlock />
      <StEthRewardedBlock />
      <AverageAprBlock />
      <StEthPriceBlock />
    </>
  );
};
