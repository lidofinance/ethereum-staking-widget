import { FC, RefObject, PropsWithChildren, useCallback, useRef } from 'react';

import { useForceUpdate } from 'shared/hooks/useForceUpdate';
import { LayoutEffectSsrDelayed } from 'shared/components/layout-effect-ssr-delayed';
import { NAV_MOBILE_HEIGHT, NAV_MOBILE_MAX_WIDTH } from 'styles/constants';
import { getScreenSize } from 'utils/getScreenSize';

import {
  ClaimFormFooter,
  ClaimFormFooterWrapper,
  ClaimFooterBodyEnder,
} from './styles';
import {
  REQUESTS_LIST_MIN_HEIGHT,
  REQUESTS_LIST_ITEM_SIZE,
} from './requests-list/styles';

// Adding 2/3 of item size to make next item slightly visible
// so user can understand that there is scrollable list
const STICK_CHECKPOINT_OFFSET =
  REQUESTS_LIST_MIN_HEIGHT + Math.floor(REQUESTS_LIST_ITEM_SIZE * 0.66);

type ScrollState = {
  isSticked: boolean;
};

type ScrollStateSetter = <
  F extends keyof ScrollState,
  V extends ScrollState[F],
>(
  field: F,
  value: V,
) => void;

type ClaimFormFooterStickyProps = {
  isEnabled: boolean;
  refRequests: RefObject<HTMLDivElement>;
  positionDeps: unknown[];
};

export const ClaimFormFooterSticky: FC<
  PropsWithChildren<ClaimFormFooterStickyProps>
> = ({ isEnabled, refRequests, positionDeps, children }) => {
  const forceUpdate = useForceUpdate();
  const refFooter = useRef<HTMLDivElement>(null);

  // Need to keep `scrollState` object mutable to make
  // frequent operations performant during scroll
  const { current: scrollState } = useRef<ScrollState>({
    isSticked: false,
  });

  const setStateAndUpdate = useCallback<ScrollStateSetter>(
    function (field, value) {
      scrollState[field] = value;
      forceUpdate();
    },
    [scrollState, forceUpdate],
  );

  const updatePosition = useCallback(() => {
    const elRequests = refRequests.current;
    const elFooter = refFooter.current;

    if (!elRequests || !elFooter) return;

    // Sizes
    const { y: screenH, x: screenW } = getScreenSize();
    const rectRequests = elRequests.getBoundingClientRect();
    const rectFooter = elFooter.getBoundingClientRect();
    const menuOffset = screenW < NAV_MOBILE_MAX_WIDTH ? NAV_MOBILE_HEIGHT : 0;

    // Calcs
    const checkpointStart = screenH - STICK_CHECKPOINT_OFFSET - menuOffset;
    const distanceFromElStart = -Math.min(
      0,
      rectRequests.top - checkpointStart,
    );

    const checkpointEnd = rectFooter.bottom - screenH + menuOffset;

    // Apply
    if (distanceFromElStart > 0 && Math.round(checkpointEnd) >= 0) {
      if (!scrollState.isSticked) {
        setStateAndUpdate('isSticked', true);
      }
    } else {
      if (scrollState.isSticked) {
        setStateAndUpdate('isSticked', false);
      }
    }
    // Eslint is disabled here to omit mutable deps for better performance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const positionInitializatorEffect = useCallback(() => {
    if (!isEnabled) return;

    // Event subscriptions
    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  const positionRevalidionEffect = useCallback(() => {
    if (!isEnabled) return;
    updatePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  return (
    <>
      <ClaimFormFooterWrapper
        isSticked={isEnabled && scrollState.isSticked}
        ref={refFooter}
      >
        <ClaimFormFooter>
          <ClaimFooterBodyEnder>
            <div />
            <div />
            <div />
          </ClaimFooterBodyEnder>
          {children}
        </ClaimFormFooter>
      </ClaimFormFooterWrapper>
      <LayoutEffectSsrDelayed
        effect={positionInitializatorEffect}
        deps={[isEnabled]}
      />
      <LayoutEffectSsrDelayed
        effect={positionRevalidionEffect}
        deps={[isEnabled, ...positionDeps]}
      />
    </>
  );
};
