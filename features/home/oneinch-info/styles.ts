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
`;

export const ButtonWrap = styled.div`
  flex: 0 0 auto;
`;
