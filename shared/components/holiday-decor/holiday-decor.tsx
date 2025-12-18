import { useThemeToggle } from '@lidofinance/lido-ui';

import {
  HolidaysTopLeftSVG,
  HolidaysTopLeftInvertedSVG,
  HolidaysTopRightSVG,
  HolidaysTopRightInvertedSVG,
} from 'assets/holidays';

import {
  HolidaysDecorBottomFlexContainer,
  StyledHolidaysTopLeft,
  StyledHolidaysTopRight,
  StyledHolidaysBottomLeft,
  StyledHolidaysBottomRight,
  FourPointStar,
  FourPointStarSmall,
  FourPointStarLarge,
  HolidayDecorBottomWrapper,
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
      <HolidayDecorBottomWrapper>
        <StyledHolidaysBottomLeft />
        <FourPointStarLarge bottom={30} left={10} animationDelay={1.5} />
        <FourPointStarSmall bottom={10} left={50} animationDelay={0} />
        <FourPointStar bottom={20} left={134} animationDelay={1} />
      </HolidayDecorBottomWrapper>
      <HolidayDecorBottomWrapper>
        <StyledHolidaysBottomRight />
        <FourPointStarLarge bottom={30} right={20} animationDelay={1.5} />
        <FourPointStarSmall bottom={10} right={70} animationDelay={0} />
        <FourPointStar bottom={10} right={200} animationDelay={1} />
      </HolidayDecorBottomWrapper>
    </HolidaysDecorBottomFlexContainer>
  );
};
