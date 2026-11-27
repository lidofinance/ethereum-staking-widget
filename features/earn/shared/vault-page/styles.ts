import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

const MAIN_COLUMN_WIDTH = 620;
const SIDE_COLUMN_WIDTH = 360;

export const PageRoot = styled.div`
  width: 100%;
  max-width: ${MAIN_COLUMN_WIDTH + SIDE_COLUMN_WIDTH + 20}px;
  margin: 0 auto;
  padding-top: var(--lido-app-ui-space-32);
  font-family: var(--lido-app-ui-font-family);
  color: var(--lido-app-ui-color-text-default);

  @media ${downQuery('lg')} {
    max-width: ${MAIN_COLUMN_WIDTH}px;
  }
`;

export const PageColumns = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--lido-app-ui-space-20);

  // one column: hero, then the side panel, then the other cards
  @media ${downQuery('lg')} {
    flex-direction: column;
    align-items: stretch;
    gap: var(--lido-app-ui-space-12);
  }
`;

export const MainColumn = styled.div`
  display: flex;
  flex: 1 1 ${MAIN_COLUMN_WIDTH}px;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
  min-width: 0;

  // the children join the parent flex column, so the side panel can go between them
  @media ${downQuery('lg')} {
    display: contents;
  }
`;

export const CardsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-12);
  min-width: 0;

  @media ${downQuery('lg')} {
    order: 2;
  }
`;

export const SideColumn = styled.div`
  position: sticky;
  top: var(--lido-app-ui-space-16);
  flex: 0 0 ${SIDE_COLUMN_WIDTH}px;
  min-width: 0;
  scroll-margin-top: var(--lido-app-ui-space-16);

  @media ${downQuery('lg')} {
    position: static;
    order: 1;
    flex-basis: auto;
  }
`;
