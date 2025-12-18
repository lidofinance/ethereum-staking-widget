import { FC } from 'react';
import { ContainerProps } from '@lidofinance/lido-ui';
import { useConfig } from 'config';
import { useRouter } from 'next/router';

import { MainStyle } from './styles';
import { EARN_PATH } from 'consts/urls';

export const Main: FC<ContainerProps> = (props) => {
  const { size = 'tight', ...rest } = props;
  const { featureFlags } = useConfig().externalConfig;
  const router = useRouter();
  // Needed only for holiday decor to be displayed correctly on earn page (holidayDecorEnabled)
  const isEarnVault = router.pathname.includes(`${EARN_PATH}/[vault]/[action]`);

  return (
    <MainStyle
      size={size}
      forwardedAs="main"
      isHolidayDecorEnabled={featureFlags.holidayDecorEnabled}
      isEarnVault={isEarnVault}
      {...rest}
    />
  );
};
