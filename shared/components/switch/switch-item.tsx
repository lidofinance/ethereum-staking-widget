import Link from 'next/link';
import { useRouter } from 'next/router';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { children, href, ...rest } = props;
  const router = useRouter();
  const active = router.asPath === href;

  return (
    <Link passHref href={href} {...rest}>
      <SwitchItemStyled active={active}>{children}</SwitchItemStyled>
    </Link>
  );
};
