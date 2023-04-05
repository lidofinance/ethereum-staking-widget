import styled from 'styled-components';
import Curve from 'assets/icons/curve.svg';

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

export const ButtonWrap = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
`;

export const ButtonLinkWrap = styled.a`
  display: block;
`;
