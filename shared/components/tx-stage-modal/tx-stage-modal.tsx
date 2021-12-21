import { FC, memo, useCallback, useMemo, RefObject } from 'react';
import { css } from 'styled-components';
import { BigNumber } from 'ethers';
import { useSDK } from '@lido-sdk/react';
import { useConnectorInfo } from '@lido-sdk/web3-react';
import {
  Link,
  Modal,
  ModalProps,
  LedgerFail,
  LedgerConfirm,
  LedgerLoading,
  LedgerSuccess,
} from '@lidofinance/lido-ui';
import { getEtherscanTxLink } from '@lido-sdk/helpers';
import { formatBalance, formatBalanceString } from 'utils';
import {
  BoldText,
  FailIcon,
  IconWrapper,
  LightText,
  SuccessIcon,
  TxLoader,
  LedgerIconWrapper,
} from './styles';

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
  allowanceAmount?: BigNumber;
  failedText?: string;
  formRef?: RefObject<HTMLFormElement>;
}

const iconsDict = {
  ledger: {
    [TX_STAGE.SUCCESS]: (
      <LedgerIconWrapper>
        <LedgerSuccess fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.SIGN]: (
      <LedgerIconWrapper>
        <LedgerConfirm fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.FAIL]: (
      <LedgerIconWrapper>
        <LedgerFail fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.BLOCK]: (
      <LedgerIconWrapper>
        <LedgerLoading fill="transparent" />
      </LedgerIconWrapper>
    ),
  },
  default: {
    [TX_STAGE.SUCCESS]: (
      <IconWrapper>
        <SuccessIcon />
      </IconWrapper>
    ),
    [TX_STAGE.FAIL]: (
      <IconWrapper>
        <FailIcon />
      </IconWrapper>
    ),
    [TX_STAGE.SIGN]: <TxLoader size="large" />,
    [TX_STAGE.BLOCK]: <TxLoader size="large" />,
  },
};

export const TxStageModal: FC<TxStageModalProps> = memo(
  ({
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
    formRef,
    ...modalProps
  }) => {
    const { chainId } = useSDK();
    const { isLedger } = useConnectorInfo();
    const currentIconDict = iconsDict[isLedger ? 'ledger' : 'default'];
    const isCloseButtonHidden =
      isLedger && ![TX_STAGE.SUCCESS, TX_STAGE.FAIL].includes(txStage);

    const balanceAsString = useMemo(
      () => (balance ? formatBalance(balance, 4) : ''),
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
          return 'Unlock successful!';
        case TX_OPERATION.WRAPPING:
          return 'Wrapping operation was successful';
        case TX_OPERATION.UNWRAPPING:
          return 'Unwrapping operation was successful';
        default:
          return 'Operation was successful';
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
              {currentIconDict[TX_STAGE.SIGN]}
              <BoldText>
                You are now{' '}
                <span
                  css={css`
                    text-transform: lowercase;
                  `}
                >
                  {operationText}
                </span>{' '}
                {withOptionaLineBreak(formatBalanceString(amount, 4))}{' '}
                {amountToken}
              </BoldText>
              <LightText
                size="xxs"
                color="secondary"
                css={css`
                  margin-top: 4px;
                `}
              >
                {operationText} {formatBalanceString(amount, 4)} {amountToken}.{' '}
                {txOperation !== TX_OPERATION.APPROVING && (
                  <>
                    You will receive {formatBalanceString(willReceiveAmount, 4)}{' '}
                    {willReceiveAmountToken}
                  </>
                )}
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
              {currentIconDict[TX_STAGE.BLOCK]}
              <BoldText>
                You are now{' '}
                <span
                  css={css`
                    text-transform: lowercase;
                  `}
                >
                  {operationText}
                </span>{' '}
                {withOptionaLineBreak(formatBalanceString(amount, 4))}{' '}
                {amountToken}
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
              {currentIconDict[TX_STAGE.SUCCESS]}
              {txOperation !== TX_OPERATION.APPROVING && (
                <>
                  <BoldText>
                    Your new balance is <wbr />
                    {withOptionaLineBreak(balanceAsString)} {balanceToken}
                  </BoldText>
                  <LightText
                    size="xxs"
                    color="secondary"
                    css={css`
                      margin-top: 4px;
                    `}
                  >
                    {operationWasSuccessfulText}
                  </LightText>
                </>
              )}
              {txOperation === TX_OPERATION.APPROVING && allowanceAmount && (
                <>
                  <BoldText>{operationWasSuccessfulText}</BoldText>
                  <LightText
                    size="xxs"
                    color="secondary"
                    css={css`
                      margin-top: 4px;
                    `}
                  >
                    {formatBalance(allowanceAmount, 4)} stETH was unlocked to
                    wrap.
                  </LightText>
                </>
              )}
              {etherscanTxLinkBlock}
            </>
          ) : null;
        case TX_STAGE.FAIL:
          return (
            <>
              {currentIconDict[TX_STAGE.FAIL]}
              <BoldText>Tx Signature Fail</BoldText>
              <LightText
                size="xxs"
                color="secondary"
                css={css`
                  margin-top: 4px;
                `}
              >
                The transaction signature was denied.
              </LightText>
              {formRef && formRef.current && (
                <LightText
                  size="xxs"
                  color="secondary"
                  css={css`
                    margin-top: 38px;
                  `}
                >
                  <Link
                    onClick={() => formRef.current?.requestSubmit()}
                    css={css`
                      cursor: pointer;
                    `}
                  >
                    Retry
                  </Link>
                </LightText>
              )}
            </>
          );
      }
    }, [
      txStage,
      txOperation,
      operationText,
      withOptionaLineBreak,
      amount,
      amountToken,
      willReceiveAmount,
      willReceiveAmountToken,
      etherscanTxLinkBlock,
      txHash,
      balance,
      balanceAsString,
      balanceToken,
      allowanceAmount,
      operationWasSuccessfulText,
      formRef,
      currentIconDict,
    ]);

    return (
      <Modal
        {...modalProps}
        onClose={isCloseButtonHidden ? undefined : modalProps.onClose}
      >
        {content}
      </Modal>
    );
  },
);
