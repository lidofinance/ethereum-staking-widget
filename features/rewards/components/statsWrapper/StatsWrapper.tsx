import { FC } from 'react';

import { StatsWrapperStyle, StatsContentWrapper } from './StatsWrapperStyles';

export const StatsWrapper: FC = ({ children }) => {
  return (
    <StatsWrapperStyle>
      <StatsContentWrapper>{children}</StatsContentWrapper>
    </StatsWrapperStyle>
  );
};
