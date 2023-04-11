import { useLayoutEffect } from 'react';
import { useSsrMode } from 'shared/hooks/useSsrMode';

/**
 * useLayoutEffect in standalone component to be delayed during ssr
 * https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
 */

type LayoutEffectProps = {
  effect: React.EffectCallback;
  deps: React.DependencyList;
};

const LayoutEffectApplyer = ({ effect, deps }: LayoutEffectProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(effect, deps);
  return null;
};

export const LayoutEffectSsrDelayed = (props: LayoutEffectProps) => {
  const isSsr = useSsrMode();
  return isSsr ? null : <LayoutEffectApplyer {...props} />;
};
