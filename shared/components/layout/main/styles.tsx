import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

export const MainStyle = styled(Container)<
  ContainerProps & { isHolidayDecorEnabled?: boolean }
>`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: ${({ isHolidayDecorEnabled = false }) =>
      isHolidayDecorEnabled ? '38px' : 'unset'};
  }
`;
