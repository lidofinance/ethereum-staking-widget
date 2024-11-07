import type { BigNumber } from 'ethers';
import { Link, Loader } from '@lidofinance/lido-ui';

import { config } from 'config';
import { WITHDRAWALS_CLAIM_PATH } from 'consts/urls';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';
import { trackMatomoEvent } from 'utils/track-matomo-event';

import { useNftDataByTxHash } from 'features/withdrawals/hooks/useNftDataByTxHash';
import { useTransactionModal } from 'shared/transaction-modal/transaction-modal';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic/tx-stage-success';
import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { LocalLink } from 'shared/components/local-link';

import {
  Title,
  NFTBanner,
  NFTImageWrap,
  NFTImage,
  NFTImageExample,
  AddNftWrapper,
} from './styles';
import { useConnectorInfo } from 'reef-knot/core-react';

const LINK_ADD_NFT_GUIDE = `${config.helpOrigin}/en/articles/7858367-how-do-i-add-the-lido-nft-to-metamask`;

type TxRequestStageSuccessProps = {
  txHash: string | null;
  tokenName: string;
  amount: BigNumber;
};

export const TxRequestStageSuccess = ({
  txHash,
  tokenName,
  amount,
}: TxRequestStageSuccessProps) => {
  const amountEl = <TxAmount amount={amount} symbol={tokenName} />;
  const { isInjected: showAddGuideLink } = useConnectorInfo();
  const { data: nftData, initialLoading: nftLoading } =
    useNftDataByTxHash(txHash);
  const { closeModal } = useTransactionModal();

  const successDescription = (
    <span>
      Withdrawal request for {amountEl} has been sent.
      <br />
      Check{' '}
      <LocalLink href={WITHDRAWALS_CLAIM_PATH} onClick={closeModal}>
        Claim tab
      </LocalLink>{' '}
      to view your withdrawal requests or view your transaction on{' '}
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
      title={'Withdrawal request successfully sent'}
      description={successDescription}
      showEtherscan={false}
      footer={
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
      }
    />
  );
};
