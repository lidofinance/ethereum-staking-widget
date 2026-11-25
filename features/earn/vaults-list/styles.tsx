import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

const CARDS_MAX_WIDTH = 800;
const PAGE_MAX_WIDTH = 1000;

export const ListRoot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: ${PAGE_MAX_WIDTH}px;
  margin: 0 auto;
  font-family: var(--lido-app-ui-font-family);
  color: var(--lido-app-ui-color-text-default);
`;

export const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
  padding-top: var(--lido-app-ui-space-32);
  text-align: center;
  text-wrap: balance;

  @media ${downQuery('sm')} {
    padding-top: var(--lido-app-ui-space-24);

    & > h1 {
      font-size: var(--lido-app-ui-font-size-h2);
      line-height: var(--lido-app-ui-line-height-h2);
      letter-spacing: var(--lido-app-ui-letter-spacing-h2);
    }
  }
`;

export const CardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
  width: 100%;
  max-width: ${CARDS_MAX_WIDTH}px;
  padding-top: var(--lido-app-ui-space-32);

  @media ${downQuery('sm')} {
    gap: var(--lido-app-ui-space-16);
    padding-top: var(--lido-app-ui-space-24);
  }
`;

export const LegacyVaults = styled.div`
  padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-32);
  border-radius: var(--lido-app-ui-border-radius-lg);
  background: var(--lido-app-ui-color-background-default);

  // Work around an Accordion bug in lido-app-ui 2.0.0: collapsed content adds page scroll.
  // Clip the content wrapper without relying on generated CSS class names.
  > div > button[aria-expanded] + div {
    overflow: hidden;
  }

  @media ${downQuery('sm')} {
    padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
  }
`;

export const LegacyVaultsList = styled.div`
  display: flex;
  flex-direction: column;
  // the Accordion body adds 24px below; the last row padding is enough
  margin-bottom: calc(-1 * var(--lido-app-ui-space-24));
  color: var(--lido-app-ui-color-text-default);
`;

export const Disclaimers = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);
  width: 100%;
  margin: var(--lido-app-ui-space-52) 0 var(--lido-app-ui-space-32);
  font-size: var(--lido-app-ui-font-size-tooltip);
  line-height: var(--lido-app-ui-line-height-description);
  letter-spacing: var(--lido-app-ui-letter-spacing-tooltip);
  color: var(--lido-app-ui-color-text-tertiary);

  p {
    margin: 0;
  }

  // the APR text puts a <br> between its paragraphs
  br {
    display: block;
    content: '';
    margin-top: var(--lido-app-ui-space-16);
  }

  a,
  a:visited {
    color: var(--lido-app-ui-color-text-active);
  }
`;
