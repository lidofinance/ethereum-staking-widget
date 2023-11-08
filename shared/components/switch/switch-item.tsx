import { useMemo } from 'react';
import { useRouter } from 'next/router';

import { dynamics } from 'config';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';
import { checkActiveInIPFS, checkActiveInInfra } from './utils';
import { LocalLink } from '../local-link';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { children, href, ...rest } = props;
  const router = useRouter();

  const active = useMemo(
    () =>
      dynamics.ipfsMode
        ? checkActiveInIPFS(router.asPath, href)
        : checkActiveInInfra(router.asPath, href),
    [router.asPath, href],
  );

  return (
    <LocalLink href={href} style={{ zIndex: 2 }} {...rest}>
      <SwitchItemStyled active={active}>{children}</SwitchItemStyled>
    </LocalLink>
  );
};
