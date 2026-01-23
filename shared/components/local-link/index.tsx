import React, { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';

import { config } from 'config';
import { LinkIpfs } from 'shared/components/link-ipfs';

// TODO: make LocalLink support passing hash
// Currently, hash is not supported because LinkIpfs does not support it,
// since routing in IPFS is using hashes like this: /#/path
// Ideally, LocalLink must be compatible with href as object

export const LocalLink: FC<PropsWithChildren<LinkProps>> = (props) => {
  const router = useRouter();
  const { ref, embed, app, theme, earn, forceAllowance } = router.query;
  const { href, ...restProps } = props;

  const extraQuery = {} as Record<string, string>;
  // does not support duplicates ?ref=01234&ref=56789

  if (ref && typeof ref === 'string') extraQuery.ref = ref;
  if (embed && typeof embed === 'string') extraQuery.embed = embed;
  if (app && typeof app === 'string') extraQuery.app = app;
  if (theme && typeof theme === 'string') extraQuery.theme = theme;
  if (earn && typeof earn === 'string') extraQuery.earn = earn;
  if (forceAllowance && typeof forceAllowance === 'string')
    extraQuery.forceAllowance = forceAllowance;

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
