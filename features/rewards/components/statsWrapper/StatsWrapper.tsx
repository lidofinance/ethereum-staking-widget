import { FC, PropsWithChildren } from 'react';

import { StatsWrapperStyle, StatsContentWrapper } from './StatsWrapperStyles';

export const StatsWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <StatsWrapperStyle>
      <StatsContentWrapper>{children}</StatsContentWrapper>
    </StatsWrapperStyle>
  );
};
