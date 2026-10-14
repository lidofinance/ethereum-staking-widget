import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

type MainStyleProps = ContainerProps & {
  isHolidayDecorEnabled?: boolean;
  isEarnVault?: boolean;
};

export const MainStyle = styled(Container)<MainStyleProps>`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: ${({ isHolidayDecorEnabled, isEarnVault }) =>
      isHolidayDecorEnabled ? (isEarnVault ? '88px' : '48px') : 'unset'};
    padding-top: 0px;
  }
`;
