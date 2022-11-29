import React, { FC } from 'react';

import {
  LoaderWrapperStyle,
  ContentStyle,
  LoaderStyle,
} from './RewardsTableLoaderStyles';

export const RewardsTableLoader: FC<React.HTMLAttributes<HTMLDivElement>> = (
  props,
) => (
  <LoaderWrapperStyle {...props}>
    <ContentStyle>
      <LoaderStyle />
    </ContentStyle>
  </LoaderWrapperStyle>
);
