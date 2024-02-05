import { memo } from 'react';

import { L2LowFee } from 'shared/banners/l2-low-fee';
import { ModalProps } from '@lidofinance/lido-ui';
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
} from '../tx-stages-basic';
import { TxStageLimit } from 'shared/transaction-modal/tx-stages-basic/tx-stage-limit';
import { FormatToken } from 'shared/formatters';
import { TxLinkEtherscan } from '../../components/tx-link-etherscan';
import { TransactionModal } from '../transaction-modal';

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

export const TransactionModalStagesRouted = memo((props: TxStageModalProps) => {
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
        const successOperationText =
          txOperation === TX_OPERATION.APPROVE ? 'Unlock' : operationText;
        const successText = (
          <>
            {successOperationText} operation was successful.{' '}
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
              title={
                <>
                  <FormatToken amount={allowanceAmount} symbol={'stETH'} /> was
                  unlocked to wrap.
                </>
              }
              description={successText}
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
            footer={<L2LowFee token={balanceToken || 'stETH'} />}
          />
        );
      }
      case TX_STAGE.FAIL:
        return <TxStageFail failedText={failedText} onRetry={onRetry} />;
      case TX_STAGE.LIMIT:
        return <TxStageLimit failedText={failedText} onRetry={onRetry} />;
      default:
        return null;
    }
  };

  return (
    <TransactionModal {...modalPropsArgs} txStage={txStage} onClose={onClose}>
      {renderContent()}
    </TransactionModal>
  );
});
