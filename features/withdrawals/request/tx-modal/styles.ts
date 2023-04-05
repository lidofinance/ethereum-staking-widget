import styled from 'styled-components';
import NFT from 'assets/icons/nft.svg';

export const NFTBunner = styled.div`
  position: relative;
  height: auto;
  padding: ${({ theme }) => theme.spaceMap.xxl}px;
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
  align-items: center;
  text-align: center;
`;

export const TitleStyled = styled.span`
  line-height: 24px;
  font-size: 14px;
`;

export const DescriptionStyled = styled.span`
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  line-height: 20px;
  font-size: 12px;
  color: var(--color-text-secondary);
  opacity: 0.6;
`;

export const NFTBunnerWrapper = styled.div`
  margin-top: 24px;
`;

export const NFTIcon = styled.img.attrs({
  src: NFT,
  alt: '',
})`
  flex: 0 0 auto;
  display: block;
  width: 160px;
  height: 160px;
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
  width: 100%;
`;

export const TextWrapper = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
`;
