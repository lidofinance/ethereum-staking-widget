import styled from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

export const NotConnectedWrapper = styled.div`
  position: relative;

  // phones: keep the prompt and its button on the first screen
  @media ${downQuery('sm')} {
    max-height: 520px;
    overflow: hidden;
  }
`;

// a blurred sample of the overview behind the prompt, as in the design
export const Preview = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-24);
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
`;

export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--lido-app-ui-space-16);
  padding: var(--lido-app-ui-space-32);
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    // the blur spreads past the box, the veil covers that edge too
    inset: calc(-1 * var(--lido-app-ui-space-16));
    background: var(--lido-app-ui-color-background-surface);
    opacity: 0.8;
  }

  > * {
    position: relative;
  }
`;

export const OverlayText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--lido-app-ui-space-4);
`;
