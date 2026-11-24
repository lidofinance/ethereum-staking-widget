import styled, { css } from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

export const ActivityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-32);
`;

// the header lines run edge to edge of the card, row lines from the text
export const Table = styled.table`
  width: calc(100% + 2 * var(--portfolio-gutter));
  margin: 0 calc(-1 * var(--portfolio-gutter));
  border-collapse: collapse;
  table-layout: fixed;
`;

type CellProps = {
  $width?: number;
  // narrower on phones, so the amount keeps its room
  $mobileWidth?: number;
  // hidden from 600px down
  $desktopOnly?: boolean;
  // hidden only on the narrowest phones, as in the 375 frame
  $hideOnPhone?: boolean;
};

// the xs rule comes last, so it keeps the sm hiding of desktop-only cells
const hiddenOnPhoneCss = css<CellProps>`
  @media ${downQuery('xs')} {
    display: ${({ $hideOnPhone, $desktopOnly }) =>
      $hideOnPhone || $desktopOnly ? 'none' : 'table-cell'};
  }
`;

// columns: time, type, amount, arrow, second amount, address;
// the last shown one is the address, then the second amount, then the amount
const edgeCss = (start: string, end: string) => css`
  &:first-child {
    ${start}
  }

  &:nth-child(6) {
    ${end}
  }

  @media ${downQuery('sm')} {
    &:nth-child(5) {
      ${end}
    }
  }

  @media ${downQuery('xs')} {
    &:nth-child(3) {
      ${end}
    }
  }

  &:first-child:last-child {
    padding-right: var(--portfolio-gutter);
    background-size: calc(100% - 2 * var(--portfolio-gutter)) 1px;
    background-position: center bottom;
  }
`;

const EDGE_START = `
  padding-left: var(--portfolio-gutter);
  background-size: calc(100% - var(--portfolio-gutter)) 1px;
  background-position: right bottom;
`;
const EDGE_END = `
  padding-right: var(--portfolio-gutter);
  background-size: calc(100% - var(--portfolio-gutter)) 1px;
  background-position: left bottom;
`;
const HEAD_START = 'padding-left: var(--portfolio-gutter);';
const HEAD_END = 'padding-right: var(--portfolio-gutter);';

const cellWidth = (width?: number) => (width ? `${width}px` : 'auto');
// edge columns also hold the card gutter
const edgeWidth = (width?: number) =>
  width ? `calc(${width}px + var(--portfolio-gutter))` : 'auto';

export const Th = styled.th<CellProps>`
  width: ${({ $width }) => cellWidth($width)};
  padding: var(--lido-app-ui-space-12) var(--lido-app-ui-space-8);
  border-top: 1px solid var(--lido-app-ui-color-border-default);
  border-bottom: 1px solid var(--lido-app-ui-color-border-default);
  font-size: 12px;
  line-height: 20px;
  font-weight: 400;
  text-align: left;
  color: var(--lido-app-ui-color-text-secondary);

  &:first-child,
  &:nth-child(6) {
    width: ${({ $width }) => edgeWidth($width)};
  }

  @media ${downQuery('sm')} {
    display: ${({ $desktopOnly }) => ($desktopOnly ? 'none' : 'table-cell')};
    width: ${({ $mobileWidth, $width }) => cellWidth($mobileWidth ?? $width)};

    &:first-child {
      width: ${({ $mobileWidth, $width }) => edgeWidth($mobileWidth ?? $width)};
    }
  }

  ${hiddenOnPhoneCss}
  ${edgeCss(HEAD_START, HEAD_END)}
`;

export const Td = styled.td<CellProps>`
  height: 60px;
  padding: var(--lido-app-ui-space-8);
  background: linear-gradient(
      var(--lido-app-ui-color-border-default),
      var(--lido-app-ui-color-border-default)
    )
    left bottom / 100% 1px no-repeat;
  vertical-align: middle;

  @media ${downQuery('sm')} {
    display: ${({ $desktopOnly }) => ($desktopOnly ? 'none' : 'table-cell')};
  }

  ${hiddenOnPhoneCss}
  ${edgeCss(EDGE_START, EDGE_END)}
`;

export const TransferBox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-12);
  min-width: 0;
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  > * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Party = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const PartyIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  width: 16px;
  height: 16px;

  > svg {
    width: 100%;
    height: 100%;
  }
`;

export const Arrow = styled.span`
  display: inline-flex;
  color: var(--lido-app-ui-color-icons-secondary);
`;

export const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lido-app-ui-space-16);
  text-align: center;
`;
