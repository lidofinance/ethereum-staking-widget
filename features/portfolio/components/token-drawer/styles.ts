import styled from 'styled-components';
import { Drawer, Typography, downQuery } from '@lidofinance/lido-app-ui';

import { LocalLink } from 'shared/components/local-link';

import { COMPACT_QUERY } from '../../styles';

export const DRAWER_WIDTH = 500;
// the page stays visible above the sheet; less once the sheet is scrolled
const SHEET_TOP_GAP = 240;
const SHEET_EXPANDED_TOP_GAP = 118;

// the library drawer; the Portfolio design turns it into a sheet from 1025px down
export const Panel = styled(Drawer)`
  &:focus {
    outline: none;
  }

  @media ${COMPACT_QUERY} {
    // doubled class: these win over the library rules whatever the load order
    && {
      --local-slide-x: 0;
      --local-slide-y: 100%;

      top: auto;
      right: 0;
      left: 0;
      width: auto;
      max-height: calc(100% - ${SHEET_TOP_GAP}px);
      border-radius: 20px 20px 0 0;
    }

    &&[data-scrolled] {
      max-height: calc(100% - ${SHEET_EXPANDED_TOP_GAP}px);
    }

    // the grab bar on top of the sheet
    &&::before {
      position: absolute;
      top: var(--lido-app-ui-space-8);
      left: 50%;
      width: 64px;
      height: 4px;
      border-radius: 2px;
      background: var(--lido-app-ui-color-border-default);
      content: '';
      transform: translateX(-50%);
    }
  }
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

export const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-12);
  min-width: 0;
`;

export const Names = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const Balance = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);

  // the sheet on tablets puts the actions next to the amount
  @media ${COMPACT_QUERY} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  @media ${downQuery('sm')} {
    flex-direction: column;
    align-items: stretch;
  }
`;

// long balances wrap inside the panel
export const Amount = styled(Typography)`
  word-break: break-all;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-8);
`;

// design pill: 36px tall, white text; the main action gets the glow border
export const ActionLink = styled(LocalLink)<{ $highlight?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 24px;
  border: ${({ $highlight }) => ($highlight ? '1.5px solid #00bbff' : '0')};
  border-radius: 50px;
  background: var(--lido-app-ui-color-background-action);
  box-shadow: ${({ $highlight }) =>
    $highlight
      ? '-2px 0 6px rgba(0, 208, 255, 0.6), 2px 0 6px rgba(241, 6, 254, 0.6), 0 0 4px rgba(143, 68, 254, 0.4)'
      : 'none'};
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: -0.14px;
  white-space: nowrap;
  text-decoration: none;

  // beats the global link colours of lido-ui in every state
  &&,
  &&:link,
  &&:visited,
  &&:hover,
  &&:active {
    color: var(--lido-app-ui-color-text-inverse);
  }

  &:hover {
    background: var(--lido-app-ui-color-background-action-hover);
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);
`;

export const ChainRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-24);
`;

export const ChainName = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--lido-app-ui-space-6);

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--lido-app-ui-space-24);
`;

export const ActivityMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
  min-width: 0;
`;

export const InlineParty = styled.span`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-6);
`;
