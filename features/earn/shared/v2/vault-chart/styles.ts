import styled from 'styled-components';
import { Box, InlineLoader } from '@lidofinance/lido-ui';

export const SwitcherWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  justify-content: space-between;
`;

export const ChartInlineLoaderStyled = styled(InlineLoader)`
  display: inline-block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

export const SwitchersInlineLoaderStyled = styled(InlineLoader)`
  display: inline-block;
  max-width: 244px;
  height: 28px;
  border-radius: 10px;
`;
