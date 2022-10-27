import styled from 'styled-components';
import Curve from 'assets/icons/curve.svg';

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
    #707bb2 0%,
    #405e9e 45.71%,
    #325698 100%
  );

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const CurveIcon = styled.img.attrs({
  src: Curve,
  alt: '',
})`
  display: block;
  width: 22px;
  height: 22px;
`;

export const CurveIconWrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #3f659f;
  border-radius: 50%;
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
