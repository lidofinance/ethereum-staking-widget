import { useCallback, useState, type TransitionEvent } from 'react';

import { usePrefersReducedMotion } from '../use-prefers-reduced-motion';

import { toMotionState, type MotionPhase } from './motion';

/**
 * Motion attributes for a `motionCollapse` wrapper: `data-state` follows
 * `open`, `data-motion` is set while the height moves, so the child clips
 * only mid-transition. Spread the result onto the wrapper.
 * A first render does not animate, only later changes of `open` do.
 */
export const useCollapseMotion = (open: boolean) => {
  const isReducedMotion = usePrefersReducedMotion();
  const [prevOpen, setPrevOpen] = useState(open);
  const [motion, setMotion] = useState<MotionPhase>();

  // set during render, so data-state and data-motion change in one commit
  if (open !== prevOpen) {
    setPrevOpen(open);
    // reduced motion snaps the height on open: there is no transition to wait for
    setMotion(open ? (isReducedMotion ? undefined : 'enter') : 'exit');
  }

  const onTransitionEnd = useCallback((event: TransitionEvent<HTMLElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'grid-template-rows'
    ) {
      setMotion(undefined);
    }
  }, []);

  return {
    'data-state': toMotionState(open),
    'data-motion': motion,
    onTransitionEnd,
  };
};
