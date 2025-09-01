import { Link } from '@lidofinance/lido-ui';
import type { LinkProps } from '@lidofinance/lido-ui';
import { useRouter } from 'next/router';

import { useInpageNavigation } from 'providers/inpage-navigation';
import { OnlyInfraRender } from './only-infra-render';

export const LinkInpageAnchor = ({
  pagePath,
  hash,
  children,
  ...linkProps
}: {
  pagePath?: string;
  hash: string;
  children: React.ReactNode;
} & LinkProps) => {
  const { navigateInpageAnchor } = useInpageNavigation();
  const router = useRouter();

  return (
    // IPFS is not compatible with in-page anchor links
    <OnlyInfraRender renderIPFS={children}>
      <Link
        target="_self"
        onClick={(e) => {
          // trigger smooth-scroll only if we are on the same page
          // or if the pagePath is not provided (then we assume that the link is always in-page)
          const pathBeforeHash = `${router.asPath.split('#')[0]}`;
          if (!pagePath || pathBeforeHash === pagePath) {
            navigateInpageAnchor(e);
          }
        }}
        href={`${pagePath}${hash}`}
        {...linkProps}
      >
        {children}
      </Link>
    </OnlyInfraRender>
  );
};
