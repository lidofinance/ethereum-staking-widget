import { useMemo } from 'react';
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
  EtherscanTxLink,
} from 'features/withdrawals/shared/tx-stage-modal';
import { useTransactionModal } from 'features/withdrawals/contexts/transaction-modal-context';
import { useWithdrawals } from 'features/withdrawals/contexts/withdrawals-context';

import { NFTBanner } from './nft-banner';
import { NFTBunnerWrapper } from './styles';
import { getTokenDisplayName } from 'utils/getTokenDisplayName';

export const TxRequestModal = () => {
  const {
    dispatchModalState,
    startTx,
    requestAmount,
    token,
    txHash,
    errorText,
    isModalOpen,
    txStage,
  } = useTransactionModal();
  const { claimPath } = useWithdrawals();
  const tokenName = token ? getTokenDisplayName(token) : '';

  const amountAsString = useMemo(
    () => (requestAmount ? formatBalance(requestAmount, 4) : ''),
    [requestAmount],
  );

  const successDescription = useMemo(
    () => (
      <span>
        Withdrawal request for {amountAsString} {tokenName} has been sent.
        {<br />}
        Check {<Link href={claimPath}>Claim tab</Link>} to view your withdrawal
        requests or view your transaction on{' '}
        {<EtherscanTxLink txHash={txHash ?? undefined} text="Etherscan" />}
      </span>
    ),
    [amountAsString, claimPath, tokenName, txHash],
  );
  const successTitle = 'Withdrawal request successfully sent';

  const pendingDescription = 'Awaiting block confirmation';
  const pendingTitle = `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

  const signDescription =
    txStage === TX_STAGE.APPROVE
      ? `Approving for ${amountAsString} ${tokenName}`
      : `Requesting withdrawal for ${amountAsString} ${tokenName}`;
  const signTitle =
    txStage === TX_STAGE.APPROVE
      ? `You are now approving ${amountAsString} ${tokenName}`
      : `You are requesting withdrawal for ${amountAsString} ${tokenName}`;

  const content = useMemo(() => {
    switch (txStage) {
      case TX_STAGE.PERMIT:
        return <TxStagePermit />;
      case TX_STAGE.APPROVE:
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
            showEtherscan={false}
          >
            <NFTBunnerWrapper>
              <NFTBanner />
            </NFTBunnerWrapper>
          </TxStageSuccess>
        );
      case TX_STAGE.FAIL:
        return (
          <TxStageFail
            failedText={errorText}
            onClick={() => {
              dispatchModalState({ type: 'reset' });
              startTx && startTx();
            }}
          />
        );
      case TX_STAGE.BUNKER:
        return (
          <TxStageBunker
            onClick={startTx ?? undefined}
            onClose={() => dispatchModalState({ type: 'close_modal' })}
          />
        );
      default:
        return null;
    }
  }, [
    dispatchModalState,
    errorText,
    pendingTitle,
    signDescription,
    signTitle,
    startTx,
    successDescription,
    txHash,
    txStage,
  ]);

  return (
    <TxStageModal
      open={isModalOpen}
      onClose={() => dispatchModalState({ type: 'close_modal' })}
      txStage={txStage}
    >
      {content}
    </TxStageModal>
  );
};
