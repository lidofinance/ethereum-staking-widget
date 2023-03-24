import { useCallback, useMemo } from 'react';
import { Link } from '@lidofinance/lido-ui';

import { formatBalance } from 'utils';
import {
  TxStageModal,
  TxStagePending,
  TxStageSuccess,
  TxStageSign,
  TxStagePermit,
  TxStageFail,
  TxStageBunker,
  TX_STAGE,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useRequestTxModal, useWithdrawals } from 'features/withdrawals/hooks';
import { NFTBanner } from './nft-banner';
import { NFTBunnerWrapper } from './styles';

export const TxRequestModal = () => {
  const {
    txStage,
    txHash,
    txModalFailedText,
    txModalOpen,
    closeTxModal,
    requestAmount,
    formRef,
    tokenName,
    callback,
  } = useRequestTxModal();
  const { claimPath } = useWithdrawals();

  const onRetry = useCallback(() => {
    formRef?.current?.requestSubmit();
  }, [formRef]);

  const amountAsString = useMemo(
    () => (requestAmount ? formatBalance(requestAmount, 4) : ''),
    [requestAmount],
  );

  const successDescription = useMemo(
    () => (
      <span>
        Request withdrawal {amountAsString} {tokenName} has been send. Please
        check {<Link href={claimPath}>Claim tab</Link>} to view your withdrawal
        requests.
      </span>
    ),
    [amountAsString, claimPath, tokenName],
  );
  const successTitle = 'Withdrawal request has been send';

  const pendingDescription = 'Awaiting block confirmation';
  const pendingTitle = `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

  const signDescription = `Requesting withdrawal for ${amountAsString} ${tokenName}`;
  const signTitle = `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

  const content = useMemo(() => {
    switch (txStage) {
      case TX_STAGE.PERMIT:
        return <TxStagePermit />;
      case TX_STAGE.SIGN:
        return <TxStageSign description={signDescription} title={signTitle} />;
      case TX_STAGE.BLOCK:
        return (
          <TxStagePending
            txHash={txHash}
            description={pendingDescription}
            title={pendingTitle}
          />
        );
      case TX_STAGE.SUCCESS:
        return (
          <TxStageSuccess
            txHash={txHash}
            description={successDescription}
            title={successTitle}
          >
            <NFTBunnerWrapper>
              <NFTBanner />
            </NFTBunnerWrapper>
          </TxStageSuccess>
        );
      case TX_STAGE.FAIL:
        return <TxStageFail failedText={txModalFailedText} onClick={onRetry} />;
      case TX_STAGE.BUNKER:
        return <TxStageBunker onClick={callback} onClose={closeTxModal} />;
      default:
        return null;
    }
  }, [
    callback,
    closeTxModal,
    onRetry,
    pendingTitle,
    signDescription,
    signTitle,
    successDescription,
    txHash,
    txModalFailedText,
    txStage,
  ]);

  return (
    <TxStageModal open={txModalOpen} onClose={closeTxModal} txStage={txStage}>
      {content}
    </TxStageModal>
  );
};
