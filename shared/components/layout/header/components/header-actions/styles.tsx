import styled from 'styled-components';
import { ThemeToggler } from '@lidofinance/lido-ui';

import { devicesHeaderMedia } from 'styles/global';
import { HEADER_BANNER_Z_INDEX } from 'styles/constants';
import { Connect } from 'shared/wallet';

export const HeaderActionsStyle = styled.div`
  position: relative;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 1;
  gap: 12px;
  ${({ theme }) => theme.mediaQueries.lg} {
    gap: ${({ theme }) => theme.spaceMap.xs}px;
  }
`;

export const ThemeTogglerStyled = styled(ThemeToggler)`
  border-radius: 10px;
  margin: 0px;
`;

export const ConnectButtonStyled = styled(Connect)`
  height: 44px;
`;

export const HeaderWalletChainLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  line-height: 1.2em;

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 9px;
    // for very long network names
    text-overflow: ellipsis;
    max-width: 38px;
  }
`;

export const BannerOnlyDesktopWrapper = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 15px);
  width: 255px;
  z-index: ${HEADER_BANNER_Z_INDEX};

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;
