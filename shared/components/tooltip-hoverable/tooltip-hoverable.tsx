import {
  ForwardedRef,
  forwardRef,
  Children,
  useRef,
  cloneElement,
  useState,
  useCallback,
} from 'react';
import { TooltipPopoverStyle } from './styles';
import { useMergeRefs } from '@lidofinance/lido-ui';
import { TooltipProps } from './types';

const TooltipHoverableRaw = (
  props: TooltipProps,
  ref?: ForwardedRef<HTMLDivElement>,
) => {
  const { children, title, ...rest } = props;
  const [state, setState] = useState(false);

  const child = Children.only(children);

  const anchorRef = useRef<HTMLElement>(null);
  const mergedRef = useMergeRefs([child.ref, anchorRef]);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setState(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setState(false);
    }, 100);
  }, []);

  return (
    <>
      {cloneElement(child, {
        ref: mergedRef,
        onMouseEnter(event: React.MouseEvent<HTMLElement, MouseEvent>) {
          handleMouseEnter();
          child.props.onMouseEnter?.(event);
        },
        onMouseLeave(event: React.MouseEvent<HTMLElement, MouseEvent>) {
          handleMouseLeave();
          child.props.onMouseLeave?.(event);
        },
      })}
      <TooltipPopoverStyle
        {...rest}
        open={state}
        backdrop={false}
        anchorRef={anchorRef}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {title}
      </TooltipPopoverStyle>
    </>
  );
};

export const TooltipHoverable = forwardRef(TooltipHoverableRaw);
