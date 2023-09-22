import { FC, PropsWithChildren } from 'react';
import { RewardsListWrapperStyle } from './RewardListWrapperStyles';

export const RewardsListWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <RewardsListWrapperStyle>{children}</RewardsListWrapperStyle>;
};
