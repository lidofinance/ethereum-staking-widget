import { H1 } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

export const LayoutTitleStyle = styled(H1)`
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizesMap.xl}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.xs}px;
  line-height: 1.46em;
  text-align: center;

  &:empty {
    display: none;
  }

  @media ${devicesHeaderMedia.mobile} {
    font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  }
`;

export const LayoutSubTitleStyle = styled.h4`
  font-weight: 500;
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.5em;
  text-align: center;
  text-wrap: balance;

  margin-bottom: 30px;
  @media ${devicesHeaderMedia.mobile} {
    margin-bottom: 20px;
  }

  &:empty {
    display: none;
  }
`;

export const IPFSInfoBoxOnlyMobileAndPortableWrapper = styled.div`
  display: none;

  @media ${devicesHeaderMedia.mobile} {
    display: block;
    margin-top: -6px;
    margin-bottom: 40px;
  }
`;

export const AmountBannerOnlyMobileWrapper = styled.div`
  display: none;

  @media ${devicesHeaderMedia.mobile} {
    display: block;
    margin-top: -6px;
    margin-bottom: 40px;
    &:empty {
      display: none;
    }
  }
`;
