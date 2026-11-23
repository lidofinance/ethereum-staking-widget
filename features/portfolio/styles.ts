import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

// column width of the design frames
const CONTENT_MAX_WIDTH = 1000;

// tablets and phones get the stacked layout, as in the 1025 frames
export const COMPACT_QUERY = 'screen and (max-width: 1025px)';

export const PortfolioRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${CONTENT_MAX_WIDTH}px;
  margin: var(--lido-app-ui-space-24) auto 0;
  font-family: var(--lido-app-ui-font-family);
  color: var(--lido-app-ui-color-text-default);
`;

export const PortfolioBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
  margin-top: var(--lido-app-ui-space-32);
`;

export const TabsRow = styled.div`
  position: relative;
`;

// the age of the open tab's data, on the right of the tabs
export const TabsUpdate = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  // phones: under the tabs, where a long date still fits
  @media ${downQuery('sm')} {
    position: static;
    display: flex;
    justify-content: flex-end;
    margin-top: var(--lido-app-ui-space-8);
    transform: none;
  }
`;

export const PortfolioCard = styled.div`
  // side padding; full-bleed children such as the activity table use it
  --portfolio-gutter: ${({ theme }) => theme.spaceMap.xxl}px;

  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
  padding: var(--lido-app-ui-space-32) var(--portfolio-gutter);
  overflow: hidden;
  border-radius: 20px;
  background: var(--lido-app-ui-color-background-surface);

  // the card spans the screen over the lido-ui Container gutter
  @media ${COMPACT_QUERY} {
    margin: 0 -${({ theme }) => theme.spaceMap.xxl}px;
    padding-top: var(--lido-app-ui-space-24);
    padding-bottom: var(--lido-app-ui-space-24);
    border-radius: 0;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    --portfolio-gutter: ${({ theme }) => theme.spaceMap.lg}px;

    margin: 0 -${({ theme }) => theme.spaceMap.lg}px;
    padding-top: var(--lido-app-ui-space-16);
    padding-bottom: var(--lido-app-ui-space-16);
  }
`;

export const DesktopOnly = styled.span`
  @media ${COMPACT_QUERY} {
    display: none;
  }
`;

export const MobileOnly = styled.span`
  display: none;

  @media ${COMPACT_QUERY} {
    display: inline;
  }
`;
