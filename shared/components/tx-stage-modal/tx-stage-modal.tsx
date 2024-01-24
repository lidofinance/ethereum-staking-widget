import { memo, useRef, useState } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';
import { use1inchLinkProps } from 'features/stake/hooks';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { L2LowFee } from 'shared/banners';
import { TxStageModalShape } from './tx-stage-modal-shape';
import { ErrorMessage, formatBalance } from 'utils';
import { ModalProps } from '@lidofinance/lido-ui';
import {
  StylableLink,
  LowercaseSpan,
  ButtonLinkSmall,
  RetryButton,
  Grid,
  SkeletonBalance,
} from './styles';

import { BigNumber } from 'ethers';
import {
  withOptionaLineBreak,
  getOperationProcessingDisplayText,
  getSuccessText,
  withOptionaTooltip,
} from './text-utils';
import { TX_STAGE, TX_OPERATION } from './types';
import { TX_STAGE_MODAL_ICONS } from '../tx-stage-modal-content/icons';

interface TxStageModalProps extends ModalProps {
  txStage: TX_STAGE;
  txOperation: TX_OPERATION;
  amount: BigNumber | null;
  amountToken: string;
  willReceiveAmount?: BigNumber | null;
  willReceiveAmountToken?: string;
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
    isLedger &&
    txStage !== TX_STAGE.SUCCESS &&
    txStage !== TX_STAGE.SUCCESS_MULTISIG &&
    txStage !== TX_STAGE.FAIL;

  const modalProps = {
    ...modalPropsArgs,
    icon:
      txStage !== TX_STAGE.IDLE &&
      TX_STAGE_MODAL_ICONS[isLedger ? 'ledger' : 'default'][txStage],
    onClose: isCloseButtonHidden ? undefined : onClose,
  };

  const amountDisplay = amount
    ? formatBalance(amount, 4, { adaptive: true, elipsis: true })
    : '';
  const amountFull = amount ? formatBalance(amount, 18) : '';
  const amountEl = withOptionaTooltip(amountDisplay, amountFull);

  const willReceiveDisplay = willReceiveAmount
    ? formatBalance(willReceiveAmount, 4, { adaptive: true, elipsis: true })
    : '';
  const willReceiveFull = willReceiveAmount
    ? formatBalance(willReceiveAmount, 18)
    : '';
  const willReceiveAmountEl = withOptionaTooltip(
    willReceiveDisplay,
    willReceiveFull,
  );

  const operationText = getOperationProcessingDisplayText(txOperation);
  const amountWithBreak = withOptionaLineBreak(amountDisplay, amountEl);

  const [isRetryLoading, setRetryLoading] = useState(false);
  const retryResetTimerRef = useRef<NodeJS.Timeout | 0>(0);
  const onRetryClick: React.MouseEventHandler = (event) => {
    if (!isRetryLoading) {
      if (retryResetTimerRef.current) {
        clearTimeout(retryResetTimerRef.current);
      }
      setRetryLoading(true);
      onRetry(event);
      retryResetTimerRef.current = setTimeout(() => {
        setRetryLoading(false);
      }, 5000);
    }
  };

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
            {operationText} {amountEl} {amountToken}.{' '}
            {txOperation !== TX_OPERATION.APPROVING && (
              <>
                You will receive {willReceiveAmountEl} {willReceiveAmountToken}
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

  if (txStage === TX_STAGE.SUCCESS_MULTISIG) {
    return (
      <TxStageModalShape
        {...modalProps}
        title="Success"
        description="Your transaction has been successfully created in the multisig wallet and awaits approval from other participants"
      />
    );
  }

  if (txStage === TX_STAGE.SUCCESS) {
    const successText = getSuccessText(txHash, txOperation);

    if (txOperation === TX_OPERATION.APPROVING && allowanceAmount) {
      return (
        <TxStageModalShape
          {...modalProps}
          title={successText}
          description={`${formatBalance(
            allowanceAmount,
            4,
          )} stETH was unlocked to wrap.`}
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
            {balance ? (
              <>
                {withOptionaLineBreak(formatBalance(balance, 4))} {balanceToken}
              </>
            ) : (
              <SkeletonBalance />
            )}
          </>
        }
        description={successText}
        footer={<L2LowFee token={balanceToken || 'stETH'} />}
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
            <StylableLink aria-disabled={isRetryLoading} onClick={onRetryClick}>
              Retry
            </StylableLink>
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
              <RetryButton color="secondary" onClick={onRetryClick} size="xs">
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
