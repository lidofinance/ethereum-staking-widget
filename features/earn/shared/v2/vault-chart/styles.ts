import styled from 'styled-components';
import { Box, InlineLoader } from '@lidofinance/lido-ui';

export const SwitcherWrapper = styled(Box)<{ disabled: boolean }>`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  justify-content: space-between;

  & div {
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
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

export const ErrorMessageStyled = styled(Box)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: var(--lido-color-text);
  opacity: 0.5;
  background-color: #e1e4e8;
  border-radius: 10px;
`;
