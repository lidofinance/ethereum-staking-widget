import React, { FC, PropsWithChildren } from 'react';
import { useSearchParams } from 'react-router';
import Link, { LinkProps } from 'next/link';

import { config } from 'config';
import { LinkIpfs } from 'shared/components/link-ipfs';

// TODO: make LocalLink support passing hash
// Currently, hash is not supported because LinkIpfs does not support it,
// since routing in IPFS is using hashes like this: /#/path
// Ideally, LocalLink must be compatible with href as object

const PASSTHROUGH_PARAMS = [
  'ref',
  'embed',
  'app',
  'theme',
  'earn',
  'forceAllowance',
] as const;

export const LocalLink: FC<PropsWithChildren<LinkProps>> = (props) => {
  const [searchParams] = useSearchParams();
  const { href, ...restProps } = props;

  const extraQuery = {} as Record<string, string>;
  // does not support duplicates ?ref=01234&ref=56789 (takes the first value)
  for (const key of PASSTHROUGH_PARAMS) {
    const value = searchParams.get(key);
    if (value) extraQuery[key] = value;
  }

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
