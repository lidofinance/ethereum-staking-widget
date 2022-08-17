import styled from 'styled-components';
import BgSrc from 'assets/icons/oneinch-info-bg.svg';
import OneInchIconSrc from 'assets/icons/oneinch.svg';

export const Wrap = styled.div`
  margin-top: 16px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
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

  @media (max-width: 440px) {
    padding-top: 20px;
    padding-bottom: 20px;
    flex-wrap: wrap;
    height: auto;
    background-size: cover;
    background-position: -10px;
  }
`;

export const OneInchIconWrap = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #000000;
  border-radius: 50%;
`;

export const OneInchIcon = styled.img.attrs({
  src: OneInchIconSrc,
  alt: '',
})`
  display: block;
  width: 36px;
  height: 36px;
`;

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 400;

  & > b {
    font-weight: 700;
  }

  @media (max-width: 440px) {
    /* Padding (20px * 2) + Gap (20px) + Logo (40px) = 100px */
    width: calc(100% - 100px);
  }
`;

export const ButtonWrap = styled.div`
  flex: 0 0 auto;

  @media (max-width: 440px) {
    width: 100%;
  }
`;

export const ButtonLinkWrap = styled.a`
  display: block;

  @media (max-width: 440px) {
    width: 100%;
  }
`;
