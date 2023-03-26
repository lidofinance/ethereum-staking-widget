import styled from 'styled-components';
import NFT from 'assets/icons/nft.svg';
import Present from 'assets/icons/present.svg';

export const NFTBunner = styled.div`
  position: relative;
  height: auto;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  background-color: var(--lido-color-backgroundSecondary);
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  overflow: hidden;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const ContentStyled = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TitleStyled = styled.span`
  line-height: 24px;
  font-size: 14px;
  font-weight: 700;
`;

export const DescriptionStyled = styled.span`
  margin-top: ${({ theme }) => theme.spaceMap.xs}px;
  line-height: 20px;
  font-size: 12px;
  color: var(--color-text-secondary);
`;

export const NFTBunnerWrapper = styled.div`
  margin-top: 44px;
`;

export const NFTIcon = styled.img.attrs({
  src: NFT,
  alt: '',
})`
  flex: 0 0 auto;
  display: block;
  width: 120px;
  height: 120px;
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
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
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
