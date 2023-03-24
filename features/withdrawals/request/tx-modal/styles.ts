import styled from 'styled-components';
import NFT from 'assets/icons/nft.svg';
import Present from 'assets/icons/present.svg';

export const NFTBunnerWrapper = styled.div`
  margin-top: 44px;
`;

export const NFTIcon = styled.img.attrs({
  src: NFT,
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

export const ButtonWrapperStyled = styled.div`
  position: relative;
`;

export const PresentIconStyled = styled.img.attrs({
  src: Present,
  alt: '',
})`
  flex: 0 0 auto;
  display: block;
  width: 24px;
  height: 24px;
  position: absolute;
  right: -12px;
  top: calc(50% - 12px);
  pointer-events: none;
`;

export const TextWrapper = styled.div`
  text-align: left;
`;
