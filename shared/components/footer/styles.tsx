import styled from 'styled-components';

import { Container, Link } from '@lidofinance/lido-ui';
import { LogoLido } from 'shared/components/logos/logos';
import { NAV_MOBILE_MEDIA } from '../header/components/navigation/styles';

export const FooterStyle = styled((props) => <Container {...props} />)`
  position: relative;
  box-sizing: border-box;
  color: var(--lido-color-text);
  display: flex;
  row-gap: 44px;
  flex-wrap: wrap;

  width: 100%;
  max-width: 1424px;
  padding: 24px 32px 32px;

  ${NAV_MOBILE_MEDIA} {
    margin-bottom: 60px;
    padding: 20px 18px;
    justify-content: center;
  }
`;

export const FooterLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 20px;
  color: var(--lido-color-textSecondary);
  font-weight: 400;

  &:visited {
    color: var(--lido-color-textSecondary);
    &:hover {
      color: var(--lido-color-text);
      opacity: 1;
    }
  }
`;

export const LinkDivider = styled.div`
  background: var(--lido-color-textSecondary);
  width: 1px;
  margin: 2px 6px;
`;

export const LogoLidoStyle = styled(LogoLido)`
  margin-right: 44px;

  ${NAV_MOBILE_MEDIA} {
    display: none;
  }
`;

export const FooterDivider = styled.div`
  position: absolute;
  top: 0;
  left: 32px;
  width: calc(100% - 64px);
  height: 1px;
  background: var(--lido-color-popupMenuItemBgActiveHover);
  opacity: 0.12;

  ${NAV_MOBILE_MEDIA} {
    display: none;
  }
`;

export const Version = styled(FooterLink)`
  margin-left: auto;
`;
