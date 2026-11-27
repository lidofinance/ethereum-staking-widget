import styled, { css } from 'styled-components';
import { downQuery } from '@lidofinance/lido-app-ui';

import { devicesHeaderMedia } from 'styles/global';

import { BAR_BOTTOM, BAR_HEIGHT, FAB_SIZE } from './consts';

export const Bar = styled.div<{ $visible: boolean }>`
  display: none;

  @media ${downQuery('lg')} {
    position: fixed;
    bottom: calc(${BAR_BOTTOM}px + env(safe-area-inset-bottom, 0px));
    left: 50%;
    z-index: var(--lido-app-ui-z-index-fab);
    display: flex;
    align-items: center;
    gap: var(--lido-app-ui-space-12);
    height: ${BAR_HEIGHT}px;
    width: min(400px, calc(100% - 2 * var(--lido-app-ui-space-12)));
    padding: var(--lido-app-ui-space-8) var(--lido-app-ui-space-8)
      var(--lido-app-ui-space-8) var(--lido-app-ui-space-16);
    box-sizing: border-box;
    border: 1px solid var(--lido-app-ui-color-border-default);
    border-radius: var(--lido-app-ui-border-radius-xl);
    background: var(--lido-app-ui-color-background-surface);
    box-shadow: var(--lido-app-ui-shadow-default);
    transform: translateX(-50%);
    transition:
      opacity var(--lido-app-ui-duration-base)
        var(--lido-app-ui-easing-standard),
      visibility var(--lido-app-ui-duration-base);

    ${({ $visible }) =>
      !$visible &&
      css`
        visibility: hidden;
        opacity: 0;
      `}
  }

  // stay above the mobile navigation of the app
  @media ${devicesHeaderMedia.mobile} {
    bottom: calc(
      ${BAR_BOTTOM}px + var(--nav-mobile-height) +
        var(--nav-mobile-bottom-inset)
    );
  }

  // on phones the FAQ button sits in the same row, to the right of the bar
  @media ${downQuery('sm')} {
    left: var(--lido-app-ui-space-12);
    right: calc(2 * var(--lido-app-ui-space-12) + ${FAB_SIZE}px);
    width: auto;
    transform: none;
  }
`;

export const BarText = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: var(--lido-app-ui-space-8);
  min-width: 0;
  white-space: nowrap;
`;
