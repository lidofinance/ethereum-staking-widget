import { FC } from 'react';

import { LeftOptions } from './LeftOptions';
import { RightOptions } from './RightOptions';
import { RewardsListHeaderStyle } from './styles';
import { TitleStyle } from './styles';

export const RewardsListHeader: FC = () => {
  return (
    <RewardsListHeaderStyle>
      <TitleStyle>Reward history</TitleStyle>
      <LeftOptions />
      <RightOptions />
    </RewardsListHeaderStyle>
  );
};
