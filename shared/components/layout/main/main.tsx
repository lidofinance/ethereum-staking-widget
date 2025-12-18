import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';

import { MainStyle } from './styles';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;

  return (
    <MainStyle
      size={size}
      forwardedAs="main"
      isHolidayDecorEnabled={featureFlags.holidayDecorEnabled}
      {...rest}
    />
  );
};
