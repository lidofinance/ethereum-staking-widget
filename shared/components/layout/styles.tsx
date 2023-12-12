import { H1 } from '@lidofinance/lido-ui';
import styled from 'styled-components';

import { NAV_MOBILE_MEDIA } from 'styles/constants';

export const LayoutTitleStyle = styled((props) => <H1 {...props} />)`
  font-weight: 800;
  font-size: ${({ theme }) => theme.fontSizesMap.xl}px;
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

  ${NAV_MOBILE_MEDIA} {
    display: block;
    margin-top: -6px;
    margin-bottom: 40px;
  }
`;
