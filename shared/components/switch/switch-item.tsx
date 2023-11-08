import { useCompareWithRouterPath } from 'shared/hooks/use-compare-with-router-path';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';
import { LocalLink } from '../local-link';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { children, href, ...rest } = props;
  const active = useCompareWithRouterPath(href);

  return (
    <LocalLink href={href} style={{ zIndex: 2 }} {...rest}>
      <SwitchItemStyled active={active}>{children}</SwitchItemStyled>
    </LocalLink>
  );
};
