import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

type MainStyleProps = ContainerProps & {
  isHolidayDecorEnabled?: boolean;
  isEarnVault?: boolean;
};

// mobile room for the holiday decor above the content
const HOLIDAY_DECOR_OFFSET = 48;
const HOLIDAY_DECOR_EARN_VAULT_OFFSET = 88;

export const MainStyle = styled(Container)<MainStyleProps>`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: ${({ isHolidayDecorEnabled, isEarnVault }) =>
      isHolidayDecorEnabled
        ? `${isEarnVault ? HOLIDAY_DECOR_EARN_VAULT_OFFSET : HOLIDAY_DECOR_OFFSET}px`
        : 'unset'};
    padding-top: 0;
  }
`;
