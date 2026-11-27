import styled from 'styled-components';
import { StatItem, downQuery } from '@lidofinance/lido-app-ui';

import { EarnCard } from '../../earn-card';
import { VaultVisual } from '../../vault-visual';

import { ICON_SIZE_MOBILE } from './consts';

export const HeroCard = styled(EarnCard)`
  && {
    position: relative;
    isolation: isolate;
  }
`;

export const HeroBody = styled.div`
  display: flex;
  align-items: center;
  gap: var(--lido-app-ui-space-32);
  width: 100%;
  padding: var(--lido-app-ui-space-32);
  box-sizing: border-box;

  @media ${downQuery('lg')} {
    align-items: stretch;
  }

  @media ${downQuery('sm')} {
    flex-direction: column-reverse;
    gap: 0;
    padding: 0;
  }
`;

export const HeroContent = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: var(--lido-app-ui-space-20);
  min-width: 0;

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-24);
    padding: var(--lido-app-ui-space-20) var(--lido-app-ui-space-20)
      var(--lido-app-ui-space-24);
  }
`;

export const HeroHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-8);
`;

export const HeroTitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: var(--lido-app-ui-font-size-h1);
  font-weight: var(--lido-app-ui-font-weight-regular);
  line-height: var(--lido-app-ui-line-height-h1);
  letter-spacing: var(--lido-app-ui-letter-spacing-h1);

  @media ${downQuery('sm')} {
    font-size: var(--lido-app-ui-font-size-h2);
    font-weight: var(--lido-app-ui-font-weight-medium);
    line-height: var(--lido-app-ui-line-height-h2);
    letter-spacing: var(--lido-app-ui-letter-spacing-h2);
  }
`;

// body on desktop and body large on mobile
export const HeroDescription = styled.p`
  margin: 0;
  font-size: var(--lido-app-ui-font-size-label);
  line-height: var(--lido-app-ui-line-height-label);
  letter-spacing: var(--lido-app-ui-letter-spacing-label);

  @media ${downQuery('sm')} {
    font-size: var(--lido-app-ui-font-size-body);
    line-height: var(--lido-app-ui-line-height-body);
    letter-spacing: var(--lido-app-ui-letter-spacing-body);
  }
`;

export const HeroStatsRow = styled.div`
  display: flex;
  gap: var(--lido-app-ui-space-32);
`;

export const HeroStat = styled(StatItem)`
  && {
    flex: 1 1 0;
    gap: 0;
    min-width: 0;
  }
`;

// the rings are wider than the box; the card clips them
export const HeroVisual = styled(VaultVisual)`
  flex: 0 0 200px;
  height: 138px;
  z-index: -1;

  @media ${downQuery('lg')} {
    flex-basis: 160px;
    height: auto;
  }

  @media ${downQuery('sm')} {
    flex-basis: auto;
    height: ${ICON_SIZE_MOBILE}px;
  }
`;
