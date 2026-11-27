import styled from 'styled-components';
import { Card, DataList, StatItem, downQuery } from '@lidofinance/lido-app-ui';

import { VaultVisual } from '../../shared/vault-visual';

export const ICON_SIZE = 200;
export const ICON_SIZE_MOBILE = 144;

export const CardRoot = styled(Card)`
  && {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-radius: 40px;
  }
`;

export const CardOverlayLink = styled.a`
  && {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
`;

// the Card has no padding; the body sets it, so the mobile visual can span the full width
export const CardBody = styled.div`
  display: flex;
  gap: var(--lido-app-ui-space-32);
  width: 100%;
  padding: var(--lido-app-ui-space-32);
  box-sizing: border-box;

  @media ${downQuery('sm')} {
    flex-direction: column-reverse;
    gap: 0;
    padding: 0;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: var(--lido-app-ui-space-32);
  min-width: 0;

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-24);
    padding: var(--lido-app-ui-space-20);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-8);
`;

export const CardTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--lido-app-ui-space-8) var(--lido-app-ui-space-20);

  @media ${downQuery('sm')} {
    column-gap: var(--lido-app-ui-space-12);
  }
`;

// the title is h1 in the desktop frames and h2 in the mobile frame
export const CardTitleText = styled.h2`
  margin: 0;
  font-size: var(--lido-app-ui-font-size-h1);
  font-weight: var(--lido-app-ui-font-weight-regular);
  line-height: var(--lido-app-ui-line-height-h1);
  letter-spacing: var(--lido-app-ui-letter-spacing-h1);

  @media ${downQuery('sm')} {
    font-size: var(--lido-app-ui-font-size-h2);
    line-height: var(--lido-app-ui-line-height-h2);
    letter-spacing: var(--lido-app-ui-letter-spacing-h2);
  }
`;

// sits over the overlay link, so its tooltip opens on hover
export const Interactive = styled.span`
  position: relative;
  z-index: 2;
  display: inline-flex;
`;

// over the overlay link; clicks on empty space still reach the link
const aboveOverlay = `
  position: relative;
  z-index: 2;
  pointer-events: none;

  & a,
  & button,
  & [tabindex] {
    pointer-events: auto;
  }
`;

export const CardStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--lido-app-ui-space-16) var(--lido-app-ui-space-32);
  ${aboveOverlay}
`;

export const CardStatItem = styled(StatItem)`
  && {
    flex: 0 1 auto;
    gap: 0;
  }
`;

export const CardDataList = styled(DataList)`
  && {
    gap: var(--lido-app-ui-space-8);
    ${aboveOverlay}
  }
`;

// keeps the stale APY tooltip trigger above the overlay link
export const StatValueTrigger = styled(Interactive)`
  display: block;
`;

// the button shows its own hover state
export const CardCta = styled.div`
  ${aboveOverlay}

  @media ${downQuery('sm')} {
    & a,
    & button {
      width: 100%;
    }
  }
`;

export const CardWarning = styled.div`
  ${aboveOverlay}

  // the warning element often renders nothing; then skip the extra gap
  &:empty {
    display: none;
  }
`;

// the rings overflow behind the text, so the visual sits under the content
export const CardVisual = styled(VaultVisual)`
  flex: 0 0 ${ICON_SIZE}px;
  align-self: stretch;
  min-height: ${ICON_SIZE}px;
  z-index: -1;

  @media ${downQuery('sm')} {
    flex-basis: auto;
    height: ${ICON_SIZE_MOBILE}px;
    min-height: 0;
  }
`;

// stands in for CardCta; the card gap gives the top space
export const VaultCardGeoNoticeWrapper = styled.div`
  position: relative;
  z-index: 2;
  pointer-events: none;

  & a,
  & button {
    pointer-events: auto;
  }
`;
