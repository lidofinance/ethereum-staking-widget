import { useRouter } from 'next/router';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';
import { LocalLink } from '../header/components/navigation/local-link';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { children, href, ...rest } = props;
  const router = useRouter();
  const active = router.asPath === href;

  return (
    <LocalLink passHref href={href} {...rest}>
      <SwitchItemStyled active={active}>{children}</SwitchItemStyled>
    </LocalLink>
  );
};
