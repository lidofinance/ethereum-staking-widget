import React, { MouseEventHandler, useCallback, useMemo } from 'react';

import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';
import { getBasedHashHref } from 'utils/get-based-hash-href';

type LinkIpfsProps = React.ComponentProps<'a'> & {
  href: string;
  query: Record<string, string>;
};

export const LinkIpfs = ({
  href,
  query,
  onClick,
  children,
  ...props
}: LinkIpfsProps) => {
  const push = usePrefixedPush();

  // Actual for click (opening in same tab)
  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      event.preventDefault();
      void push(href, query);

      window.scrollTo({ top: 0 });

      onClick?.(event);
    },
    [onClick, push, href, query],
  );

  // Actual for opening in new tab
  const basedHashHref = useMemo(
    () => getBasedHashHref(href, query),
    [href, query],
  );

  return (
    <a {...props} href={basedHashHref} onClick={handleClick}>
      {children}
    </a>
  );
};
