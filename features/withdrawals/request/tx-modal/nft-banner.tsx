import { ButtonIcon, Plus } from '@lidofinance/lido-ui';

import { useAddNFT } from 'features/withdrawals/hooks';

import {
  NFTIcon,
  ButtonWrapperStyled,
  TextWrapper,
  NFTBunner,
  ContentStyled,
  TitleStyled,
  DescriptionStyled,
} from './styles';

export const NFTBanner = () => {
  const { canAddNft, addNft } = useAddNFT();

  return (
    <NFTBunner>
      <ContentStyled>
        <NFTIcon />

        <TextWrapper>
          <TitleStyled>
            {canAddNft ? (
              <>
                Add this NFT to your wallet to monitor status
                of&nbsp;your&nbsp;request
              </>
            ) : (
              <>
                Add NFT to your wallet to monitor status
                of&nbsp;your&nbsp;request.
              </>
            )}
          </TitleStyled>
        </TextWrapper>
        {canAddNft && (
          <ButtonWrapperStyled>
            <ButtonIcon
              icon={<Plus />}
              fullwidth
              size="sm"
              variant="filled"
              onClick={addNft}
            >
              Add NFT to wallet
            </ButtonIcon>
          </ButtonWrapperStyled>
        )}
        <DescriptionStyled>For withdrawals participants only</DescriptionStyled>
      </ContentStyled>
    </NFTBunner>
  );
};
