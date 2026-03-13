import styled from 'styled-components';
import { Table, Thead, Th, Td } from '@lidofinance/lido-ui';

export const TableStyled = styled(Table)`
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
  padding-left: ${({ theme }) => theme.spaceMap.xxl}px;

  & > div:first-child {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

export const ProtocolNameStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Group row styles
export const GroupTdStyled = styled(TdStyled)`
  cursor: pointer;
`;

export const GroupNameStyled = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
`;

export const ChevronStyled = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: ${({ $open }) => ($open ? 'rotate(0deg)' : 'rotate(-90deg)')};

  &::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    margin-top: -4px;
  }
`;

// Flat rows (Other allocation, Available) — same weight as group rows
export const FlatTdStyled = styled(TdStyled)`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
`;
