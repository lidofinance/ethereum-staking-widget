import styled from 'styled-components';
import NFTExample from 'assets/nft-example.png';

export const NFTBanner = styled.div`
  position: relative;
  height: auto;
  margin-top: 24px;
  padding: ${({ theme }) => theme.spaceMap.xxl}px;
  background-color: var(--lido-color-backgroundSecondary);
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  overflow: hidden;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const NFTImageWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
`;

export const NFTImage = styled.img.attrs({
  alt: '',
})`
  flex: 0 0 auto;
  display: block;
  width: auto;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-right: 8px;
  }
`;

export const NFTImageExample = styled(NFTImage).attrs({
  src: NFTExample.src,
})`
  position: relative;
  left: 20px;
  height: 140%;
`;

export const AddNftWrapper = styled.div`
  position: relative;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  width: 100%;
`;

export const Title = styled.div`
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
  line-height: 24px;
  font-size: 14px;
`;
