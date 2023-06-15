import { memo } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';
import { use1inchLinkProps } from 'features/home/hooks';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { ModalPoolBanners } from 'shared/banners';
import { TxStageModalShape } from './tx-stage-modal-shape';
import { ErrorMessage, formatBalance, formatBalanceString } from 'utils';
import { ModalProps } from '@lidofinance/lido-ui';
import {
  StylableLink,
  LowercaseSpan,
  ButtonLinkSmall,
  RetryButton,
  Grid,
} from './styles';

import { BigNumber } from 'ethers';
import {
  withOptionaLineBreak,
  getOperationProcessingDisplayText,
  getSuccessText,
} from './text-utils';
import { TX_STAGE, TX_OPERATION } from './types';
import { TX_STAGE_MODAL_ICONS } from '../tx-stage-modal-content/icons';

interface TxStageModalProps extends ModalProps {
  txStage: TX_STAGE;
  txOperation: TX_OPERATION;
  amount: string;
  amountToken: string;
  willReceiveAmount?: string;
  willReceiveAmountToken?: string;
  txHash?: string;
  balance?: BigNumber;
  balanceToken?: string;
  allowanceAmount?: BigNumber;
  failedText?: string;
  onRetry: React.MouseEventHandler;
}

export const TxStageModal = memo((props: TxStageModalProps) => {
  const {
    txStage,
    txOperation,
    txHash,
    amount,
    amountToken,
    willReceiveAmount,
    willReceiveAmountToken,
    balance,
    balanceToken,
    allowanceAmount,
    failedText,
    onRetry,
    onClose,
    ...modalPropsArgs
  } = props;

  const { isLedger } = useConnectorInfo();
  const oneInchLinkProps = use1inchLinkProps();
  const isCloseButtonHidden =
    isLedger && txStage !== TX_STAGE.SUCCESS && txStage !== TX_STAGE.FAIL;

  const modalProps = {
    ...modalPropsArgs,
    icon:
      txStage !== TX_STAGE.IDLE &&
      TX_STAGE_MODAL_ICONS[isLedger ? 'ledger' : 'default'][txStage],
    onClose: isCloseButtonHidden ? undefined : onClose,
  };

  const operationText = getOperationProcessingDisplayText(txOperation);
  const amountString = formatBalanceString(amount, 4);
  const amountWithBreak = withOptionaLineBreak(amountString);

  if (txStage === TX_STAGE.IDLE) {
    return null;
  }

  if (txStage === TX_STAGE.SIGN) {
    return (
      <TxStageModalShape
        {...modalProps}
        title={
          <>
            You are now <LowercaseSpan>{operationText}</LowercaseSpan>{' '}
            {amountWithBreak} {amountToken}
          </>
        }
        description={
          <>
            {operationText} {amountString} {amountToken}.{' '}
            {txOperation !== TX_OPERATION.APPROVING && (
              <>
                You will receive {formatBalanceString(willReceiveAmount, 4)}{' '}
                {willReceiveAmountToken}
              </>
            )}
          </>
        }
        footerHint="Confirm this transaction in your wallet"
      />
    );
  }

  if (txStage === TX_STAGE.BLOCK) {
    return (
      <TxStageModalShape
        {...modalProps}
        title={
          <>
            You are now <LowercaseSpan>{operationText}</LowercaseSpan>{' '}
            {amountWithBreak} {amountToken}
          </>
        }
        description="Awaiting block confirmation"
        footerHint={<TxLinkEtherscan txHash={txHash} />}
      />
    );
  }

  if (txStage === TX_STAGE.SUCCESS) {
    if (!balance) return null;

    const successText = getSuccessText(txHash, txOperation);
    const balanceFormatted = balance
      ? withOptionaLineBreak(formatBalance(balance, 4))
      : '';

    if (txOperation === TX_OPERATION.APPROVING && allowanceAmount) {
      return (
        <TxStageModalShape
          {...modalProps}
          title={successText}
          description={
            <>
              {allowanceAmount && formatBalance(allowanceAmount, 4)} stETH was
              unlocked to wrap.
            </>
          }
          footerHint={<TxLinkEtherscan txHash={txHash} />}
        />
      );
    }

    return (
      <TxStageModalShape
        {...modalProps}
        title={
          <>
            Your new balance is <wbr />
            {balanceFormatted} {balanceToken}
          </>
        }
        description={successText}
        footer={<ModalPoolBanners />}
      />
    );
  }

  if (txStage === TX_STAGE.FAIL) {
    return (
      <TxStageModalShape
        {...modalProps}
        title="Transaction Failed"
        description={failedText ?? 'Something went wrong'}
        footerHint={
          failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
            <StylableLink onClick={onRetry}>Retry</StylableLink>
          )
        }
      />
    );
  }

  if (txStage === TX_STAGE.LIMIT) {
    return (
      <TxStageModalShape
        {...modalProps}
        title="Stake limit exhausted"
        description={failedText ?? 'Something went wrong'}
        footer={
          failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
            <Grid>
              <RetryButton color="secondary" onClick={onRetry} size="xs">
                Retry
              </RetryButton>
              <ButtonLinkSmall {...oneInchLinkProps}>
                Swap on 1inch
              </ButtonLinkSmall>
            </Grid>
          )
        }
      />
    );
  }

  return null;
});
