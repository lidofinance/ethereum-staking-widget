import { useRouter } from 'next/router';

import { dynamics } from 'config';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';
import { LocalLink } from '../local-link';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { children, href, ...rest } = props;
  const router = useRouter();

  let asPath = router.asPath;
  if (asPath.slice(-1) === '/') {
    asPath = asPath.slice(0, -1);
  }

  let active: boolean;
  if (dynamics.ipfsMode) {
    active = asPath.split(/[?#]/)[1] === href;
  } else {
    active = asPath.split(/[?#]/)[0] === href;
  }

  return (
    <LocalLink href={href} style={{ zIndex: 2 }} {...rest}>
      <SwitchItemStyled active={active}>{children}</SwitchItemStyled>
    </LocalLink>
  );
};
