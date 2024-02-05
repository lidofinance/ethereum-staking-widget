import { memo } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { L2LowFee } from 'shared/banners/l2-low-fee';
import { Modal, ModalProps } from '@lidofinance/lido-ui';
import { SkeletonBalance } from './styles';

import { BigNumber } from 'ethers';
import { TX_STAGE, TX_OPERATION } from 'shared/transaction-modal';
import {
  TxStageFail,
  TxStagePending,
  TxStagePermit,
  TxStageSign,
  TxStageSuccess,
  TxStageSuccessMultisig,
} from 'features/withdrawals/shared/tx-stage-modal';
import { TxStageLimit } from 'features/withdrawals/shared/tx-stage-modal/stages/tx-stage-limit';
import { FormatToken } from 'shared/formatters';
import { TxLinkEtherscan } from '../tx-link-etherscan';

interface TxStageModalProps extends ModalProps {
  txStage: TX_STAGE;
  txOperation: TX_OPERATION;
  amount: BigNumber | null;
  amountToken: string;
  willReceiveAmount?: BigNumber | null;
  willReceiveAmountToken?: string;
  operationText: string;
  txHash?: string | null;
  balance?: BigNumber;
  balanceToken?: 'stETH' | 'wstETH';
  allowanceAmount?: BigNumber;
  failedText?: string | null;
  onRetry: React.MouseEventHandler;
}

export const TxStageModal = memo((props: TxStageModalProps) => {
  const {
    txStage,
    txOperation,
    txHash,
    amount,
    amountToken,
    willReceiveAmount = '',
    willReceiveAmountToken,
    operationText,
    balance,
    balanceToken,
    allowanceAmount,
    failedText,
    onRetry,
    onClose,
    ...modalPropsArgs
  } = props;

  const { isLedger } = useConnectorInfo();

  const isCloseButtonHidden =
    isLedger &&
    txStage !== TX_STAGE.SUCCESS &&
    txStage !== TX_STAGE.SUCCESS_MULTISIG &&
    txStage !== TX_STAGE.FAIL;

  const amountEl = amount && (
    <FormatToken
      amount={amount}
      symbol={amountToken}
      adaptiveDecimals
      trimEllipsis
    />
  );

  const approvingTitle = <>You are now approving {amountEl}</>;
  const approvingDescription = <>Approving for {amountEl}</>;

  const operationTitle = (
    <>
      You are now {operationText.toLowerCase()} {amountEl}
    </>
  );
  const operationDescription = (
    <>
      {operationText} {amountEl}.{' '}
      {txOperation !== TX_OPERATION.APPROVE && (
        <>
          You will receive{' '}
          {willReceiveAmount && (
            <FormatToken
              amount={willReceiveAmount}
              symbol={willReceiveAmountToken || ''}
              adaptiveDecimals
              trimEllipsis
            />
          )}{' '}
          {willReceiveAmountToken}
        </>
      )}
    </>
  );

  const renderSign = () => {
    switch (txOperation) {
      case TX_OPERATION.APPROVE:
        return (
          <TxStageSign
            title={approvingTitle}
            description={approvingDescription}
          />
        );
      case TX_OPERATION.CONTRACT:
        return (
          <TxStageSign
            title={operationTitle}
            description={operationDescription}
          />
        );
      case TX_OPERATION.PERMIT:
        return <TxStagePermit />;
      default:
        return null;
    }
  };

  const renderBlock = () => {
    switch (txOperation) {
      case TX_OPERATION.APPROVE:
        return <TxStagePending txHash={txHash} title={approvingTitle} />;
      case TX_OPERATION.CONTRACT:
        return <TxStagePending txHash={txHash} title={operationTitle} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (txStage) {
      case TX_STAGE.SIGN:
        return renderSign();
      case TX_STAGE.BLOCK:
        return renderBlock();
      case TX_STAGE.SUCCESS_MULTISIG:
        return <TxStageSuccessMultisig />;
      case TX_STAGE.SUCCESS: {
        const successText =
          txOperation === TX_OPERATION.APPROVE ? 'Unlock' : operationText;

        const successTitle = (
          <>
            {successText} operation was successful.{' '}
            {txHash && (
              <>
                Transaction can be viewed on{' '}
                <TxLinkEtherscan txHash={txHash} text="Etherscan" />
              </>
            )}
          </>
        );

        if (txOperation === TX_OPERATION.APPROVE && allowanceAmount) {
          return (
            <TxStageSuccess
              txHash={txHash}
              title={successTitle}
              description={
                <>
                  <FormatToken amount={allowanceAmount} symbol={'stETH'} /> was
                  unlocked to wrap.
                </>
              }
            />
          );
        }

        return (
          <TxStageSuccess
            txHash={txHash}
            title={
              <>
                Your new balance is <wbr />
                {balance && balanceToken ? (
                  <FormatToken amount={balance} symbol={balanceToken} />
                ) : (
                  <SkeletonBalance />
                )}
              </>
            }
            description={successText}
            showEtherscan={false}
          >
            <L2LowFee token={balanceToken || 'stETH'} />
          </TxStageSuccess>
        );
      }
      case TX_STAGE.FAIL:
        return <TxStageFail failedText={failedText} onClickRetry={onRetry} />;
      case TX_STAGE.LIMIT:
        return <TxStageLimit failedText={failedText} onClickRetry={onRetry} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      {...modalPropsArgs}
      onClose={isCloseButtonHidden ? undefined : onClose}
    >
      {renderContent()}
    </Modal>
  );
});
