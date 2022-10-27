import styled from 'styled-components';
import Balancer from 'assets/icons/balancer-banner-icon.svg';

export const Wrapper = styled.div`
  position: relative;
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  overflow: hidden;
  background: radial-gradient(
    100% 459.2% at 0% 0%,
    #696785 0%,
    #2c2b30 47.68%,
    #1f1f1f 100%
  );

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

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

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  position: relative;
  white-space: nowrap;
  margin-right: 8px;
`;

export const ButtonWrap = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
`;

export const ButtonLinkWrap = styled.a`
  display: block;
`;
