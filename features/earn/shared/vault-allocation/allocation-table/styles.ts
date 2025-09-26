import styled from 'styled-components';
import { Table, Thead, Th, Td } from '@lidofinance/lido-ui';
import { FormatToken } from 'shared/formatters';

export const TableStyled = styled(Table)`
  width: 100%;
  width: calc(100% + ${({ theme }) => 2 * theme.spaceMap.xxl}px);
  margin: 0 ${({ theme }) => -theme.spaceMap.xxl}px;
  margin-top: 32px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: calc(100% + ${({ theme }) => 2 * theme.spaceMap.lg}px);
    margin: 0 ${({ theme }) => -theme.spaceMap.lg}px;
    margin-top: 32px;
    overflow-x: auto;
  }
`;

export const TheadStyled = styled(Thead)`
  border-top: none;

  & > tr {
    &::before,
    &::after {
      border-top: none;
      border-bottom: none;
    }
  }
`;

export const ThStyled = styled(Th)`
  border-top: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  line-height: 20px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
`;

export const ThWithTipStyled = styled(ThStyled)`
  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: end;
  }
`;

export const TdStyled = styled(Td)`
  font-weight: 400;
  line-height: 24px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  padding: 8px;
`;

export const TdNarrowStyled = styled(TdStyled)`
  width: 1%;
`;

export const TdWithIconStyled = styled(TdStyled)`
  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const DataTableRowContentStyled = styled.div`
  display: flex;
  flex-direction: column;
`;

export const FormatTokenStyled = styled(FormatToken)`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  line-height: 20px;
`;

export const ProtocolNameStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
