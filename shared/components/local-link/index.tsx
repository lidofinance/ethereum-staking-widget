import React, {
  AnchorHTMLAttributes,
  forwardRef,
  PropsWithChildren,
} from 'react';
import Link, { LinkProps } from 'next/link';

import { config } from 'config';
import { LinkIpfs } from 'shared/components/link-ipfs';

import { usePreservedQueryParams } from './use-local-navigate';

export { useLocalNavigate } from './use-local-navigate';

// TODO: make LocalLink support passing hash
// Currently, hash is not supported because LinkIpfs does not support it,
// since routing in IPFS is using hashes like this: /#/path
// Ideally, LocalLink must be compatible with href as object

type LocalLinkProps = PropsWithChildren<
  LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
>;

// forwardRef: lido-app-ui LinkProvider needs the ref on the <a>
export const LocalLink = forwardRef<HTMLAnchorElement, LocalLinkProps>(
  (props, ref) => {
    const preservedQuery = usePreservedQueryParams();
    const { href, ...restProps } = props;

    if (typeof href === 'string') {
      if (config.ipfsMode) {
        return (
          <LinkIpfs
            {...restProps}
            ref={ref}
            href={href}
            query={preservedQuery}
          />
        );
      }

      return (
        <Link
          {...restProps}
          ref={ref}
          legacyBehavior={false}
          href={{ pathname: href, query: preservedQuery }}
        />
      );
    }

    throw new Error('Prop href as object is not compatible');
  },
);
LocalLink.displayName = 'LocalLink';
