import { FC } from 'react';

import { SwitchItem } from './switch-item';
import { SwitchWrapper, Handle } from './styles';
import { SwitchProps } from './types';
import { trackMatomoEvent } from 'utils/track-matomo-event';

export const Switch: FC<SwitchProps> = (props) => {
  const { checked, routes, fullwidth, className } = props;

  return (
    <SwitchWrapper className={className} $fullwidth={fullwidth}>
      <Handle $checked={checked} $fullwidth={fullwidth} />
      <SwitchItem
        href={routes[0].path}
        onClick={() =>
          routes[0].matomoEvent && trackMatomoEvent(routes[0].matomoEvent)
        }
      >
        {routes[0].name}
      </SwitchItem>
      <SwitchItem
        href={routes[1].path}
        onClick={() =>
          routes[1].matomoEvent && trackMatomoEvent(routes[1].matomoEvent)
        }
      >
        {routes[1].name}
      </SwitchItem>
    </SwitchWrapper>
  );
};
