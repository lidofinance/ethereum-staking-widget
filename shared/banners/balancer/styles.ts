import styled from 'styled-components';
import Balancer from 'assets/icons/balancer-banner-icon.svg';

export const BalancerIcon = styled.img.attrs({
  src: Balancer,
  alt: '',
})`
  flex: 0 0 auto;
  display: block;
  width: 40px;
  height: 40px;
  margin-right: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 8px;
  }
`;

export const ButtonLinkWrap = styled.a`
  display: block;
`;
