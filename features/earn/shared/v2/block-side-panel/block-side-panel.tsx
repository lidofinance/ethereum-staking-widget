import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';
import { ReactNode } from 'react';

const StyledBlockSidePanel = styled(Block).attrs({ paddingLess: true })`
  // removing default paddings
  padding: 20px;
`;

export const BlockSidePanel = ({ children }: { children: ReactNode }) => (
  <StyledBlockSidePanel>{children}</StyledBlockSidePanel>
);
