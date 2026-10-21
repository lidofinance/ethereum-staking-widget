import React, { AnchorHTMLAttributes, FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';

import { config } from 'config';
import { PRODUCT_QUERY_KEYS } from 'config/external-config/products';
import { LinkIpfs } from 'shared/components/link-ipfs';

// TODO: make LocalLink support passing hash
// Currently, hash is not supported because LinkIpfs does not support it,
// since routing in IPFS is using hashes like this: /#/path
// Ideally, LocalLink must be compatible with href as object

const KEPT_QUERY_KEYS: readonly string[] = [
  'ref',
  'embed',
  'app',
  'theme',
  'forceAllowance',
  ...PRODUCT_QUERY_KEYS,
];

type LocalLinkProps = PropsWithChildren<
  LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
>;

export const LocalLink: FC<LocalLinkProps> = (props) => {
  const router = useRouter();
  const { href, ...restProps } = props;

  // keeps URL order: product params resolve conflicts by order
  const extraQuery = {} as Record<string, string | string[]>;
  for (const [key, value] of Object.entries(router.query)) {
    // only product params may repeat: ?product=earn&product=stake
    const isKept =
      typeof value === 'string' || (Array.isArray(value) && key === 'product');
    if (value && isKept && KEPT_QUERY_KEYS.includes(key)) {
      extraQuery[key] = value;
    }
  }

  if (typeof href === 'string') {
    if (config.ipfsMode) {
      // repeated `product` params are equal to a comma-separated one
      const ipfsQuery = Object.fromEntries(
        Object.entries(extraQuery).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(',') : value,
        ]),
      );
      return <LinkIpfs {...restProps} href={href} query={ipfsQuery} />;
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
