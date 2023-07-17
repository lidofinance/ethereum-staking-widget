import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link';
import { FC } from 'react';

export const LocalLink: FC<React.PropsWithChildren<LinkProps>> = (props) => {
  const router = useRouter();
  const { ref, embed, app } = router.query;
  const { href, ...restProps } = props;

  const extraQuery = {} as { [key: string]: string | string[] };
  if (ref) extraQuery.ref = ref;
  if (embed) extraQuery.embed = embed;
  if (app) extraQuery.app = app;

  if (typeof href === 'string') {
    return <Link {...restProps} href={{ pathname: href, query: extraQuery }} />;
  }

  throw new Error('Prop href is not compatible');
};
