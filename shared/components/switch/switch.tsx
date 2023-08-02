import { FC } from 'react';

import { SwitchItem } from './switch-item';
import { SwitchWrapper, Handle } from './styles';
import { SwitchProps } from './types';

export const Switch: FC<SwitchProps> = (props) => {
  const { checked, routes } = props;

  return (
    <SwitchWrapper>
      <Handle $checked={checked} />
      <SwitchItem href={routes[0].path}>{routes[0].name}</SwitchItem>
      <SwitchItem href={routes[1].path}>{routes[1].name}</SwitchItem>
    </SwitchWrapper>
  );
};
