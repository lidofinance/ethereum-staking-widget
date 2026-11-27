import { css } from 'styled-components';

// Ports of the lido-app-ui motion mixins (@lidofinance/lido-app-ui/styles/motion-mixins.css):
// the app has no postcss-mixins, so they live here as styled-components helpers.
// Keyed the same way: data-state (open / closed), data-motion (enter / exit) while moving.

export type MotionState = 'open' | 'closed';
export type MotionPhase = 'enter' | 'exit';

export const toMotionState = (open: boolean): MotionState =>
  open ? 'open' : 'closed';

type MotionTimings = {
  enter?: string;
  exit?: string;
};

/** `@mixin motion-fade`: opacity fade, closed is transparent. */
export const motionFade = ({
  enter = 'var(--lido-app-ui-duration-fast)',
  exit = 'var(--lido-app-ui-duration-fast-exit)',
}: MotionTimings = {}) => css`
  transition: opacity ${enter} var(--lido-app-ui-easing-out);

  &[data-state='closed'] {
    opacity: 0;
    transition-duration: ${exit};
    transition-timing-function: var(--lido-app-ui-easing-exit);
  }

  @media (prefers-reduced-motion: reduce) {
    transition-duration: var(--lido-app-ui-duration-fast);

    &[data-state='closed'] {
      transition-duration: var(--lido-app-ui-duration-fast-exit);
    }
  }
`;

/**
 * `@mixin motion-collapse`: height collapse on a wrapper; its single child
 * is the clip. Drive it with `useCollapseMotion`.
 */
export const motionCollapse = ({
  enter = 'var(--lido-app-ui-duration-base)',
  exit = 'var(--lido-app-ui-duration-base-exit)',
}: MotionTimings = {}) => css`
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows ${enter} var(--lido-app-ui-easing-out);

  & > * {
    min-height: 0;
    transition: opacity ${enter} var(--lido-app-ui-easing-out);
  }

  &[data-motion] > * {
    overflow: hidden;
  }

  &[data-state='closed'] {
    grid-template-rows: 0fr;
    transition-duration: ${exit};
    transition-timing-function: var(--lido-app-ui-easing-exit);
  }

  &[data-state='closed'] > * {
    opacity: 0;
    transition-duration: ${exit};
  }

  &[data-state='closed']:not([data-motion]) > * {
    visibility: hidden;
    overflow: hidden;
  }

  /* height snaps after the fade-out so the exit stays awaitable:
     a 0s transition with a delay still runs (duration + delay > 0) */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    & > * {
      transition-duration: var(--lido-app-ui-duration-fast);
    }

    &[data-state='closed'] {
      transition: grid-template-rows 0s linear
        var(--lido-app-ui-duration-fast-exit);
    }

    &[data-state='closed'] > * {
      transition-duration: var(--lido-app-ui-duration-fast-exit);
    }
  }
`;
