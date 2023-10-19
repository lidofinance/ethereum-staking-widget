import React, { FC, PropsWithChildren } from 'react';
import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';

import { dynamics } from 'config';
import { LinkIpfs } from 'shared/components/link-ipfs';

export const LocalLink: FC<PropsWithChildren<LinkProps>> = (props) => {
  const router = useRouter();
  const { ref, embed, app } = router.query;
  const { href, ...restProps } = props;

  const extraQuery = {} as { [key: string]: string | string[] };
  if (ref) extraQuery.ref = ref;
  if (embed) extraQuery.embed = embed;
  if (app) extraQuery.app = app;

  if (typeof href === 'string') {
    if (dynamics.ipfsMode) {
      // TODO: href + extraQuery?
      return <LinkIpfs {...restProps} href={href} />;
    }

    return (
      <Link {...restProps} href={{ pathname: href, query: extraQuery }}>
        {/* TODO: fix when go to Next v13+ */}
        {/* see: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration#link-component */}
        {/* eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <a {...restProps} />
      </Link>
    );
  }

  throw new Error('Prop href is not compatible');
};
