import { useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { useSsrMode } from 'shared/hooks/useSsrMode';

/**
 * useLayoutEffect in standalone component to be delayed during ssr
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 */

type LayoutEffectProps = {
  effect: React.EffectCallback;
  deps: React.DependencyList;
};

type LayoutEffectSsrDelayedProps = LayoutEffectProps & {
  // Also wait for the Next router to be ready: on a direct load its `query`
  // (and everything read from the URL) is empty until then. The effect first
  // runs once the router is ready, with the real query
  waitForNextRouter?: boolean;
};

const LayoutEffectApplyer = ({ effect, deps }: LayoutEffectProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(effect, deps);
  return null;
};

export const LayoutEffectSsrDelayed = ({
  waitForNextRouter = false,
  ...props
}: LayoutEffectSsrDelayedProps) => {
  const isSsr = useSsrMode();
  const router = useRouter();
  const isWaitingForRouter = waitForNextRouter && !router?.isReady;
  return isSsr || isWaitingForRouter ? null : (
    <LayoutEffectApplyer {...props} />
  );
};
