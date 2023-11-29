import { useSDK } from '@lido-sdk/react';
import { Link, Loader } from '@lidofinance/lido-ui';

import {
  trackMatomoEvent,
  MATOMO_CLICK_EVENTS_TYPES,
} from 'config/trackMatomoEvent';
import { WITHDRAWALS_CLAIM_PATH } from 'config/urls';
import { useNftDataByTxHash } from 'features/withdrawals/hooks/useNftDataByTxHash';
import { TxStageSuccess } from 'features/withdrawals/shared/tx-stage-modal';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';

import {
  Title,
  NFTBanner,
  NFTImageWrap,
  NFTImage,
  NFTImageExample,
  AddNftWrapper,
} from './styles';

const LINK_ADD_NFT_GUIDE =
  'https://help.lido.fi/en/articles/7858367-how-do-i-add-the-lido-nft-to-metamask';

type TxRequestStageSuccessProps = {
  txHash: string | null;
  tokenName: string;
  amountAsString: string;
};

export const TxRequestStageSuccess = ({
  txHash,
  tokenName,
  amountAsString,
}: TxRequestStageSuccessProps) => {
  const { providerWeb3 } = useSDK();
  const { data: nftData, initialLoading: nftLoading } =
    useNftDataByTxHash(txHash);
  const showAddGuideLink = !!providerWeb3?.provider.isMetaMask;

  const successTitle = 'Withdrawal request successfully sent';

  const successDescription = (
    <span>
      Withdrawal request for {amountAsString} {tokenName} has been sent.
      <br />
      Check <Link href={WITHDRAWALS_CLAIM_PATH}>Claim tab</Link> to view your
      withdrawal requests or view your transaction on{' '}
      <TxLinkEtherscan
        txHash={txHash ?? undefined}
        text="Etherscan"
        onClick={() =>
          trackMatomoEvent(
            MATOMO_CLICK_EVENTS_TYPES.withdrawalEtherscanSuccessTemplate,
          )
        }
      />
    </span>
  );

  const showNftLoader = nftLoading;
  const showNftRealImage = !showNftLoader && nftData && nftData.length === 1;
  const showNftExample = !showNftLoader && (!nftData || nftData.length !== 1);

  return (
    <TxStageSuccess
      txHash={txHash}
      description={successDescription}
      title={successTitle}
      showEtherscan={false}
    >
      <NFTBanner>
        <NFTImageWrap>
          {showNftLoader && <Loader />}
          {showNftRealImage && <NFTImage src={nftData[0].image} />}
          {showNftExample && <NFTImageExample />}
        </NFTImageWrap>
        <Title>
          Add NFT to your wallet to monitor the&nbsp;status
          of&nbsp;your&nbsp;request.
        </Title>
        {showAddGuideLink && (
          <AddNftWrapper>
            <Link
              href={LINK_ADD_NFT_GUIDE}
              onClick={() =>
                trackMatomoEvent(
                  MATOMO_CLICK_EVENTS_TYPES.withdrawalGuideSuccessTemplate,
                )
              }
            >
              This guide will help you to do this.
            </Link>
          </AddNftWrapper>
        )}
      </NFTBanner>
    </TxStageSuccess>
  );
};
