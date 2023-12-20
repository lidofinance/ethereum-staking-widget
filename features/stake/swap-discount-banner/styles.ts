import styled from 'styled-components';
import BgSrc from 'assets/icons/swap-banner-bg.svg';
import OpenOcean from 'assets/icons/open-ocean.svg';

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
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #07080c;

  & > * {
    position: relative;
  }

  @media (max-width: 545px) {
    padding-top: 20px;
    padding-bottom: 20px;
    flex-wrap: wrap;
    height: auto;
    background-size: cover;
    background-position: -10px;
  }
`;

export const OpenOceanIcon = styled.img.attrs({
  src: OpenOcean,
  alt: 'openOcean',
})`
  width: 40px;
  height: 40px;
  display: block;
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
