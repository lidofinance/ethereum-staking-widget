import styled from 'styled-components';
import { Table, Thead, Th, Td, Tr } from '@lidofinance/lido-ui';

export const TableStyled = styled(Table)`
  width: calc(100% + ${({ theme }) => 2 * theme.spaceMap.xxl}px);
  margin: 0 ${({ theme }) => -theme.spaceMap.xxl}px;
  margin-top: 32px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;

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

export const TrWithShiftStyled = styled(Tr)`
  & > td:first-child {
    padding-left: ${({ theme }) => theme.spaceMap.xxl}px;
  }
`;

export const TdStyled = styled(Td)`
  font-weight: 400;
  line-height: 24px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  padding: 14px;
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

export const ProtocolNamePercent = styled.span`
  font-weight: 700;
`;

// Group row styles
export const GroupTdStyled = styled(TdStyled)`
  cursor: pointer;
`;

export const GroupNameStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ChevronWrapper = styled.span<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0deg)')};
`;
