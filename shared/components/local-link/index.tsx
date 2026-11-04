import React, { AnchorHTMLAttributes, FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';

import { config } from 'config';
import { useProductQuery } from 'config/external-config/use-products-url-state';
import { LinkIpfs } from 'shared/components/link-ipfs';

// TODO: make LocalLink support passing hash
// Currently, hash is not supported because LinkIpfs does not support it,
// since routing in IPFS is using hashes like this: /#/path
// Ideally, LocalLink must be compatible with href as object

const KEPT_QUERY_KEYS = [
  'ref',
  'embed',
  'app',
  'theme',
  'forceAllowance',
] as const;

type LocalLinkProps = PropsWithChildren<
  LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
>;

export const LocalLink: FC<LocalLinkProps> = (props) => {
  const router = useRouter();
  const productQuery = useProductQuery();
  const { href, ...restProps } = props;

  const extraQuery: Record<string, string> = {};
  // does not support duplicates ?ref=01234&ref=56789
  for (const key of KEPT_QUERY_KEYS) {
    const value = router.query[key];
    if (value && typeof value === 'string') extraQuery[key] = value;
  }
  // from the products state, so they survive a navigation that lost them
  Object.assign(extraQuery, productQuery);

  if (typeof href === 'string') {
    if (config.ipfsMode) {
      return <LinkIpfs {...restProps} href={href} query={extraQuery} />;
    }

    return (
      <Link
        {...restProps}
        legacyBehavior={false}
        href={{ pathname: href, query: extraQuery }}
      />
    );
  }

  throw new Error('Prop href as object is not compatible');
};
