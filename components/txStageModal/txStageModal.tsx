import { FC, memo, useCallback, useMemo } from 'react';
import { Link, Modal, ModalProps } from '@lidofinance/lido-ui';
import {
  BoldText,
  FailIcon,
  IconWrapper,
  LightText,
  SuccessIcon,
  TxLoader,
} from './txStageModalStyles';
import { css } from 'styled-components';
import { getEtherscanTxLink } from '@lido-sdk/helpers';
import { useSDK } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

export enum TX_OPERATION {
  STAKING,
  APPROVING,
  WRAPPING,
  UNWRAPPING,
}

export enum TX_STAGE {
  IDLE,
  SIGN,
  BLOCK,
  SUCCESS,
  FAIL,
}

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
}

const TxStageModal: FC<TxStageModalProps> = ({
  txStage,
  txOperation,
  txHash,
  amount,
  amountToken,
  willReceiveAmount,
  willReceiveAmountToken,
  balance,
  balanceToken,
  ...modalProps
}) => {
  const { chainId } = useSDK();

  const balanceString = useMemo(
    () => (balance ? formatEther(balance) : ''),
    [balance],
  );

  // Inserts new lines in front of long numbers so that the currency symbol remains on the same line
  const withOptionaLineBreak = useCallback((text: string) => {
    return text.length < 8 ? (
      text
    ) : (
      <>
        <br />
        {text}
      </>
    );
  }, []);

  const operationWasSuccessfulText = useMemo(() => {
    switch (txOperation) {
      case TX_OPERATION.STAKING:
        return 'Staking operation was successful';
      case TX_OPERATION.APPROVING:
        return 'Approving operation was successful';
      case TX_OPERATION.WRAPPING:
        return 'Wrapping operation was successful';
      case TX_OPERATION.UNWRAPPING:
        return 'Unwrapping operation was successful';
      default:
        return 'Operation was successful';
    }
  }, [txOperation]);

  const operationFailedText = useMemo(() => {
    switch (txOperation) {
      case TX_OPERATION.STAKING:
        return 'Staking operation failed';
      case TX_OPERATION.APPROVING:
        return 'Approving operation failed';
      case TX_OPERATION.WRAPPING:
        return 'Wrapping operation failed';
      case TX_OPERATION.UNWRAPPING:
        return 'Unwrapping operation failed';
      default:
        return 'Operation failed';
    }
  }, [txOperation]);

  const operationText = useMemo(() => {
    switch (txOperation) {
      case TX_OPERATION.STAKING:
        return 'Staking';
      case TX_OPERATION.APPROVING:
        return 'Approving';
      case TX_OPERATION.WRAPPING:
        return 'Wrapping';
      case TX_OPERATION.UNWRAPPING:
        return 'Unwrapping';
      default:
        return 'Processing';
    }
  }, [txOperation]);

  const etherscanTxLinkBlock = useMemo(() => {
    return (
      <>
        {txHash && (
          <LightText
            size="xxs"
            color="secondary"
            css={css`
              margin-top: 38px;
            `}
          >
            <Link href={getEtherscanTxLink(chainId, txHash)}>
              View on Etherscan
            </Link>
          </LightText>
        )}
      </>
    );
  }, [chainId, txHash]);

  const content = useMemo(() => {
    switch (txStage) {
      case TX_STAGE.IDLE:
        return null;
      case TX_STAGE.SIGN:
        return (
          <>
            <TxLoader size="large" />
            <BoldText>
              You are now{' '}
              <span
                css={css`
                  text-transform: lowercase;
                `}
              >
                {operationText}
              </span>{' '}
              {withOptionaLineBreak(amount)} {amountToken}
            </BoldText>
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              {operationText} {amount} {amountToken}. You will receive{' '}
              {willReceiveAmount} {willReceiveAmountToken}
            </LightText>
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 38px;
              `}
            >
              Confirm this transaction in your wallet
            </LightText>
          </>
        );
      case TX_STAGE.BLOCK:
        return (
          <>
            <TxLoader size="large" />
            <BoldText>
              You are now{' '}
              <span
                css={css`
                  text-transform: lowercase;
                `}
              >
                {operationText}
              </span>{' '}
              {withOptionaLineBreak(amount)} {amountToken}
            </BoldText>
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              Awaiting block confirmation
            </LightText>
            {etherscanTxLinkBlock}
          </>
        );
      case TX_STAGE.SUCCESS:
        return txHash && balance ? (
          <>
            <IconWrapper>
              <SuccessIcon />
            </IconWrapper>
            {balance && (
              <BoldText>
                Your new balance is <wbr />
                {withOptionaLineBreak(balanceString)} {balanceToken}
              </BoldText>
            )}
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              {operationWasSuccessfulText}
            </LightText>
            {etherscanTxLinkBlock}
          </>
        ) : null;
      case TX_STAGE.FAIL:
        return (
          <>
            <IconWrapper>
              <FailIcon />
            </IconWrapper>
            {balance && (
              <BoldText>
                Your balance is <wbr />
                {withOptionaLineBreak(balanceString)} {balanceToken}
              </BoldText>
            )}
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              {operationFailedText}
            </LightText>
            {etherscanTxLinkBlock}
          </>
        );
    }
  }, [
    txStage,
    operationText,
    withOptionaLineBreak,
    amount,
    amountToken,
    willReceiveAmount,
    willReceiveAmountToken,
    etherscanTxLinkBlock,
    txHash,
    balance,
    balanceString,
    balanceToken,
    operationWasSuccessfulText,
    operationFailedText,
  ]);

  return <Modal {...modalProps}>{content}</Modal>;
};

export default memo(TxStageModal);
