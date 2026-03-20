import { H1 } from '@lidofinance/lido-ui';
import styled from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

type LayoutTitleProps = { $v2?: boolean } & React.ComponentProps<typeof H1>;

export const LayoutTitleStyle = styled(
  ({ $v2, ...props }: LayoutTitleProps) => <H1 {...props} />,
)`
  font-weight: ${({ $v2 }) => ($v2 ? 700 : 800)};
  font-size: ${({ $v2, theme }) => ($v2 ? 36 : theme.fontSizesMap.xl)}px;
  margin-bottom: 0.2em;
  line-height: 1.2em;
  text-align: center;

  &:empty {
    display: none;
  }
`;

export const LayoutSubTitleStyle = styled.h4`
  font-weight: 500;
  color: var(--lido-color-textSecondary);
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.5em;
  text-align: center;

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

export const WhaleBannerOnlyMobileWrapper = styled.div`
  display: none;

  @media ${devicesHeaderMedia.mobile} {
    display: block;
    margin-top: -6px;
    margin-bottom: 40px;
  }
`;
