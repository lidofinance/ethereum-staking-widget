import { createElement, forwardRef } from 'react';

/**
 * CSS-modules counterpart of a bare `styled.div\`...\``: a host element
 * bound to a class from a *.module.css file, with the same consumer
 * contract as the styled-components original — forwards ref, accepts and
 * merges an incoming className (so `styled(X)`-style restyling by parents
 * keeps working), passes every other prop through.
 *
 * Prop-driven styles don't go through JS: express variants as
 * data-attributes or inline `style={{ '--x': ... }}` custom properties at
 * the call site, and select on them in the .module.css.
 */
export const styledElement = <T extends keyof JSX.IntrinsicElements>(
  tag: T,
  className: string,
  displayName?: string,
) => {
  const component = forwardRef<HTMLElement, JSX.IntrinsicElements[T]>(
    (props, ref) =>
      createElement(tag, {
        ...props,
        ref,
        className: props.className
          ? `${className} ${props.className}`
          : className,
      }),
  );
  component.displayName = displayName ?? `styledElement(${tag})`;
  return component;
};
