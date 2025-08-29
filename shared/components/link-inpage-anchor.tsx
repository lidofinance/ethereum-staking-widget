import { Link } from '@lidofinance/lido-ui';
import type { LinkProps } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { useInpageNavigation } from 'providers/inpage-navigation';

export const LinkInpageAnchor = ({
  pagePath,
  hash,
  children,
  ...linkProps
}: {
  pagePath: string;
  hash: string;
  children: React.ReactNode;
} & LinkProps) => {
  const { navigateInpageAnchor } = useInpageNavigation();
  const router = useRouter();

  return (
    <Link
      target="_self"
      onClick={(e) => {
        // trigger smooth-scroll only if we are on the same page
        const pathBeforeHash = `${router.asPath.split('#')[0]}`;
        if (pathBeforeHash === pagePath) {
          navigateInpageAnchor(e);
        }
      }}
      href={`${pagePath}${hash}`}
      {...linkProps}
    >
      {children}
    </Link>
  );
};
