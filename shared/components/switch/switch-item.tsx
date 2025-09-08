import { useCompareWithRouterPath } from 'shared/hooks/use-compare-with-router-path';

import { SwitchItemStyled } from './styles';
import { SwitchItemComponent } from './types';

export const SwitchItem: SwitchItemComponent = (props) => {
  const { href, ...rest } = props;
  const active = useCompareWithRouterPath(href ?? '');

  return (
    <SwitchItemStyled
      scroll={false}
      href={href ?? ''}
      $active={active}
      {...rest}
    />
  );
};
