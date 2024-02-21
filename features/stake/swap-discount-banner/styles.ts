import styled from 'styled-components';
import BgSrc from 'assets/icons/swap-banner-bg.svg';
import OpenOcean from 'assets/icons/open-ocean.svg';
import OneInch from 'assets/icons/oneinch-circle.svg';

export const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 10px;
  height: 80px;
  overflow: hidden;
  background-image: url('${BgSrc}');
  background-size: auto;
  background-repeat: no-repeat;
  background-color: #07080c;

  & > * {
    position: relative;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    cursor: pointer;
  }
`;

export const OverlayLink = styled.a`
  display: block;

  ${({ theme }) => theme.mediaQueries.md} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    & > button {
      display: none;
    }
  }
`;

export const OpenOceanIcon = styled.img.attrs({
  src: OpenOcean,
  alt: 'OpenOcean',
})`
  width: 40px;
  height: 40px;
  display: block;
`;

export const OneInchIcon = styled.img.attrs({
  src: OneInch,
  alt: '1inch',
})`
  display: block;
  width: 40px;
  height: 40px;
`;

export const TextWrap = styled.p`
  flex: 1 1 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 400;

  & > b {
    font-weight: 700;
  }
`;
