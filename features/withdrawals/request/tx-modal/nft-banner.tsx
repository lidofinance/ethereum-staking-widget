import { Button } from '@lidofinance/lido-ui';

import { Banner } from 'shared/components';
import { useAddNFT } from 'features/withdrawals/hooks';

import {
  NFTIcon,
  PresentIconStyled,
  ButtonWrapperStyled,
  TextWrapper,
} from './styles';

export const NFTBanner = () => {
  const { addNft } = useAddNFT();

  return (
    <Banner
      background="nft"
      icon={<NFTIcon />}
      button={
        <ButtonWrapperStyled>
          <Button
            fullwidth
            size="xs"
            variant="text"
            color="secondary"
            onClick={addNft}
          >
            Add
          </Button>
          <PresentIconStyled />
        </ButtonWrapperStyled>
      }
    >
      <TextWrapper>
        <b>Add to wallet your free Lido NFT</b>
        <br /> For unstake participants only
      </TextWrapper>
    </Banner>
  );
};
