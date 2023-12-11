import React, {
  ReactNode,
  MouseEventHandler,
  useCallback,
  useMemo,
} from 'react';

import { usePrefixedPush } from 'shared/hooks/use-prefixed-history';
import { getBasedHashHref } from 'utils/get-based-hash-href';

type Props = {
  href: string;
  query?: Record<string, string>;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
};

export const LinkIpfs = ({ onClick, query, ...props }: Props) => {
  const push = usePrefixedPush();
  const { href } = props;

  // Actual for click (opening in same tab)
  const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (event) => {
      event.preventDefault();
      void push(href, query);

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0 });
      }

      onClick?.(event);
    },
    [onClick, push, href, query],
  );

  // Actual for opening in new tab
  const basedHashHref = useMemo(
    () => getBasedHashHref(href, query),
    [href, query],
  );

  // TODO:
  // eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
  return <a {...props} href={basedHashHref} onClick={handleClick} />;
};
