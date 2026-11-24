import styled from 'styled-components';
import { InfoTooltip, TableRow } from '@lidofinance/lido-app-ui';

import { COMPACT_QUERY } from '../../styles';

export const TableSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
`;

export const TableTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-16);

  @media ${COMPACT_QUERY} {
    flex-direction: column;
    align-items: stretch;
    gap: var(--lido-app-ui-space-12);
  }
`;

export const TableTitleStart = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-16);
`;

// the section toggle of the compact layout
export const CollapseToggle = styled.button`
  display: none;

  @media ${COMPACT_QUERY} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-left: auto;
    padding: 0;
    border: 0;
    background: none;
    color: var(--lido-app-ui-color-icons-default);
    cursor: pointer;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const Collapsible = styled.div<{ $collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);

  @media ${COMPACT_QUERY} {
    display: ${({ $collapsed }) => ($collapsed ? 'none' : 'flex')};
  }
`;

export const Share = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
`;

export const TableTitleEnd = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-16);

  // phones: total on the left, rewards on the right
  @media ${COMPACT_QUERY} {
    flex-direction: row-reverse;
    justify-content: flex-end;

    > :first-child:not(:last-child) {
      margin-left: auto;
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
`;

type CellProps = {
  $align?: 'left' | 'right';
  // hidden on phones
  $optional?: boolean;
  // the right edge of the header on phones, where the menu column is gone
  $lastOnMobile?: boolean;
  // a long label that wraps on phones instead of being cut
  $wrapOnMobile?: boolean;
};

// the hint glyph at the size the other pages show it
export const HintIcon = styled(InfoTooltip)`
  // the row keeps its height
  margin: -2px 0;

  && > svg {
    width: 24px;
    height: 24px;
  }
`;

// a header text with its hint icon on one centre line
export const ThLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);
  vertical-align: top;
`;

export const Th = styled.th<CellProps>`
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  letter-spacing: -0.14px;
  text-align: ${({ $align = 'right' }) => $align};
  white-space: nowrap;
  color: var(--lido-app-ui-color-text-secondary);
  background: var(--lido-app-ui-color-background-default);

  &:first-child {
    border-radius: 10px 0 0 10px;
  }

  &:last-child {
    border-radius: 0 10px 10px 0;
  }

  @media ${COMPACT_QUERY} {
    display: ${({ $optional }) => ($optional ? 'none' : 'table-cell')};
    white-space: ${({ $wrapOnMobile }) => ($wrapOnMobile ? 'normal' : 'nowrap')};
    border-radius: ${({ $lastOnMobile }) =>
      $lastOnMobile ? '0 10px 10px 0' : '0'};

    &:first-child {
      width: 60%;
      border-radius: 10px 0 0 10px;
    }
  }
`;

export const Td = styled.td<CellProps>`
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
  text-align: ${({ $align = 'right' }) => $align};
  vertical-align: middle;

  @media ${COMPACT_QUERY} {
    display: ${({ $optional }) => ($optional ? 'none' : 'table-cell')};
  }
`;

export const CellStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

export const TableFooter = styled.div`
  display: flex;
  padding: 0 var(--lido-app-ui-space-16);

  > button {
    width: 100%;
  }
`;

// the library row: with a click it takes focus and answers Enter and Space
export const Row = styled(TableRow)`
  &[tabindex]:hover > td,
  &:focus-visible > td {
    background: var(--lido-app-ui-color-background-default);
  }

  // doubled class: the library row removes the outline on focus
  &&:focus-visible {
    outline: 2px solid var(--lido-app-ui-color-border-active);
    outline-offset: -2px;
  }

  > td:first-child {
    border-radius: 10px 0 0 10px;
  }

  > td:last-child {
    border-radius: 0 10px 10px 0;
  }
`;

export const MoreCell = styled.td`
  width: 44px;
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-8)
    var(--lido-app-ui-space-8) 0;
  text-align: right;

  @media ${COMPACT_QUERY} {
    display: none;
  }
`;

export const MoreHead = styled.th`
  width: 44px;
  border-radius: 0 10px 10px 0;
  background: var(--lido-app-ui-color-background-default);

  @media ${COMPACT_QUERY} {
    display: none;
  }
`;

export const SkeletonAsset = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-12);

  > :first-child {
    flex-shrink: 0;
  }
`;

export const SkeletonLines = styled.div<{ $end?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $end }) => ($end ? 'flex-end' : 'flex-start')};
  gap: var(--lido-app-ui-space-4);

  > :first-child {
    width: 80px;
  }

  > :last-child {
    width: 48px;
  }
`;
