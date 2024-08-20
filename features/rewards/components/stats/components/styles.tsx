import styled from 'styled-components';
import { Box, InlineLoader as InlineLoaderLidoUI } from '@lidofinance/lido-ui';

export const Block = styled(Box)`
  flex-grow: 1;

  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 6px;
  }
`;

export const Title = styled(Box)`
  display: flex;
  height: 20px;
  line-height: 20px;
  margin-bottom: 6px;

  font-size: 12px;
  font-style: normal;
  font-weight: normal;
`;

export const Value = styled(Box)`
  display: flex;
  height: 20px;
  line-height: 20px;
  margin-bottom: 6px;

  color: var(--lido-color-text);
  font-style: normal;
  font-weight: 600;
  font-size: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    font-weight: unset;
    font-size: 12px;
  }
`;

export const ValueGreen = styled(Value)`
  color: #61b75f;
`;

export const UnderValue = styled(Title)`
  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;

export const InlineLoader = styled(InlineLoaderLidoUI)`
  width: 114px;

  ${({ theme }) => theme.mediaQueries.lg} {
    width: 60px;
  }
`;

export const FlexCenter = styled.div`
  display: flex;
  align-items: center;
`;
