import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

export const RowRoot = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-52);
  padding: var(--lido-app-ui-space-32) 0;

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-16);
    padding: var(--lido-app-ui-space-24) 0;
  }
`;

export const RowOverlayLink = styled.a`
  && {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
`;

export const RowMain = styled.div`
  display: flex;
  flex: 1 1 0;
  align-items: center;
  gap: var(--lido-app-ui-space-24);
  min-width: 0;

  @media ${downQuery('sm')} {
    align-items: flex-start;
    gap: var(--lido-app-ui-space-16);
  }
`;

export const RowIcon = styled.div`
  display: grid;
  flex: 0 0 80px;
  place-items: center;
  width: 80px;
  height: 80px;

  & > svg {
    width: 100%;
    height: 100%;
  }

  @media ${downQuery('sm')} {
    flex-basis: 56px;
    width: 56px;
    height: 56px;
  }
`;

export const RowText = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: var(--lido-app-ui-space-8);
  min-width: 0;
`;

export const RowHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
`;

export const RowTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
`;

// sits over the overlay link, so the tooltip and the button get the pointer
export const RowInteractive = styled.span`
  position: relative;
  z-index: 2;
  display: inline-flex;
`;

export const RowTvl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-4);
`;
