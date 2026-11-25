import { Container, ContainerProps } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

type MainStyleProps = ContainerProps & {
  isWinterThemeEnabled?: boolean;
  isEarnVault?: boolean;
};

// mobile room for the holiday garland under the header
const WINTER_THEME_OFFSET = 36;
const WINTER_THEME_EARN_VAULT_OFFSET = 76;

export const MainStyle = styled(Container)<MainStyleProps>`
  position: relative;
  padding-top: ${({ theme }) => theme.spaceMap.sm}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;

  @media ${devicesHeaderMedia.mobile} {
    margin-top: ${({ isWinterThemeEnabled, isEarnVault }) =>
      isWinterThemeEnabled
        ? `${isEarnVault ? WINTER_THEME_EARN_VAULT_OFFSET : WINTER_THEME_OFFSET}px`
        : 'unset'};
    padding-top: 0;
  }
`;
