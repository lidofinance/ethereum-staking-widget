import { useThemeToggle } from '@lidofinance/lido-ui';

import {
  HolidaysTopLeftSVG,
  HolidaysTopLeftInvertedSVG,
  HolidaysTopRightSVG,
  HolidaysTopRightInvertedSVG,
  HolidaysBottomLeftSVG,
  HolidaysBottomRightSVG,
} from 'assets/holidays';

import {
  HolidaysDecorBottomFlexContainer,
  StyledHolidaysTopLeft,
  StyledHolidaysTopRight,
} from './styles';
import { useConfig } from 'config';

export const HolidaysDecorTopLeft = (props: any) => {
  const { themeName } = useThemeToggle();

  return (
    <StyledHolidaysTopLeft
      {...props}
      as={
        themeName === 'dark' ? HolidaysTopLeftInvertedSVG : HolidaysTopLeftSVG
      }
    />
  );
};

export const HolidaysDecorTopRight = (props: any) => {
  const { themeName } = useThemeToggle();

  return (
    <StyledHolidaysTopRight
      {...props}
      as={
        themeName === 'dark' ? HolidaysTopRightInvertedSVG : HolidaysTopRightSVG
      }
    />
  );
};

export const HolidaysDecorHeader = () => {
  const { featureFlags } = useConfig().externalConfig;

  if (!featureFlags.holidayDecorEnabled) return null;

  return (
    <>
      <HolidaysDecorTopLeft />
      <HolidaysDecorTopRight />
    </>
  );
};

export const HolidaysDecorFooter = () => {
  const { featureFlags } = useConfig().externalConfig;

  if (!featureFlags.holidayDecorEnabled) return null;

  return (
    <HolidaysDecorBottomFlexContainer>
      <HolidaysBottomLeftSVG />
      <HolidaysBottomRightSVG />
    </HolidaysDecorBottomFlexContainer>
  );
};
