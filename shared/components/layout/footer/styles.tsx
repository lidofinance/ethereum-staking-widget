import styled from 'styled-components';
import { Container, Link } from '@lidofinance/lido-ui';

import { LogoLido } from 'shared/components/logos/logos';
import { NAV_MOBILE_MEDIA } from 'styles/constants';

import { ReactComponent as ExternalLinkIcon } from 'assets/icons/external-link-icon.svg';
import React from 'react';

export const FooterStyle = styled(Container)`
  position: relative;
  box-sizing: border-box;
  color: var(--lido-color-text);
  display: flex;
  row-gap: 12px;
  flex-wrap: wrap;

  width: 100%;
  max-width: 1424px;
  padding: 24px 32px;

  ${NAV_MOBILE_MEDIA} {
    margin-bottom: 60px;
    padding: 20px 18px;
    justify-content: center;
  }
`;

type FooterLinkProps = {
  $marginRight?: string;
};

export const FooterLink = styled(Link)<FooterLinkProps>`
  display: flex;
  align-items: center;
  line-height: 20px;
  vertical-align: middle;
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 400;

  ${({ $marginRight }) => ($marginRight ? `margin-right:${$marginRight}` : '')};

  &:visited {
    color: var(--lido-color-textSecondary);
    &:hover {
      color: var(--lido-color-text);
      opacity: 1;
      svg {
        path {
          fill: var(--lido-color-text);
        }
      }
    }
  }

  &:hover {
    svg {
      path {
        color: var(--lido-color-primaryHover);
      }
    }
  }
`;

export const LinkDivider = styled.div`
  background: var(--lido-color-border);
  width: 1px;
  margin: 2px 16px;
`;

export const LogoLidoStyle = styled(LogoLido)`
  margin-right: 32px;
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
  margin-left: 20px;
  padding: 2px 5px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.xs}px;
  background: rgba(122, 138, 160, 0.1);
`;

export const ExternalLinkIconFooter = styled(ExternalLinkIcon).attrs({
  width: 10,
  height: 10,
  viewBox: '0 0 12 12',
})`
  padding: 5px;
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  path {
    fill: var(--lido-color-textSecondary);
  }
`;

export const ExternalLink = ({
  children,
  ...props
}: React.ComponentProps<typeof FooterLink>) => (
  <FooterLink target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <ExternalLinkIconFooter />
  </FooterLink>
);
