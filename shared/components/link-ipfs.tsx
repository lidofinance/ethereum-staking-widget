import React, { ReactNode, MouseEventHandler, useCallback } from 'react';

import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';

type Props = {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
};

export const LinkIpfs = ({ onClick, ...props }: Props) => {
  const push = usePrefixedPush();
  const { href } = props;

  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      event.preventDefault();
      void push(href);
      onClick?.(event);
    },
    [onClick, push, href],
  );

  // TODO:
  // eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
  return <a {...props} onClick={handleClick} />;
};
