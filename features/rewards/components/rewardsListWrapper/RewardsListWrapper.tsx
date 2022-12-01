import { FC } from 'react';
import { RewardsListWrapperStyle } from './RewardListWrapperStyles';

export const RewardsListWrapper: FC = ({ children }) => {
  return <RewardsListWrapperStyle>{children}</RewardsListWrapperStyle>;
};
