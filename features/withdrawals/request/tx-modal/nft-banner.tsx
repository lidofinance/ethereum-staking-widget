import { Button } from '@lidofinance/lido-ui';

import { useAddNFT } from 'features/withdrawals/hooks';

import {
  NFTIcon,
  PresentIconStyled,
  ButtonWrapperStyled,
  TextWrapper,
  NFTBunner,
  ContentStyled,
  TitleStyled,
  DescriptionStyled,
} from './styles';

export const NFTBanner = () => {
  const { addNft } = useAddNFT();

  return (
    <NFTBunner>
      <NFTIcon />
      <ContentStyled>
        <TextWrapper>
          <TitleStyled>Your request is Lido NFT</TitleStyled>
          <br />
          <DescriptionStyled>
            You can add NFT to the wallet to monitor status of your request
          </DescriptionStyled>
        </TextWrapper>
        <ButtonWrapperStyled>
          <Button
            fullwidth
            size="xs"
            variant="filled"
            color="secondary"
            onClick={addNft}
          >
            Add to the wallet
          </Button>
          <PresentIconStyled />
        </ButtonWrapperStyled>
      </ContentStyled>
    </NFTBunner>
  );
};
