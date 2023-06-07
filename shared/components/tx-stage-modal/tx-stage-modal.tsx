import { FC, memo, useCallback, useMemo, RefObject } from 'react';
import { BigNumber } from 'ethers';
import { useSDK } from '@lido-sdk/react';
import { useConnectorInfo } from 'reef-knot/web3-react';
import {
  Link,
  Modal,
  ModalProps,
  LedgerFail,
  LedgerConfirm,
  LedgerLoading,
  LedgerSuccess,
  Warning,
} from '@lidofinance/lido-ui';
import { getEtherscanTxLink } from '@lido-sdk/helpers';
import { ErrorMessage, formatBalance, formatBalanceString } from 'utils';
import { use1inchLinkProps } from 'features/home/hooks';
import { ModalPoolBanners } from 'shared/banners';
import { CHAINS } from '@lido-sdk/constants';

import {
  BoldText,
  FailIcon,
  IconWrapper,
  LightText,
  SuccessIcon,
  TxLoader,
  LedgerIconWrapper,
  StylableLink,
  LowercaseSpan,
  ButtonLinkSmall,
  RetryButton,
  Grid,
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
  LIMIT,
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
    [TX_STAGE.LIMIT]: (
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
    [TX_STAGE.LIMIT]: (
      <IconWrapper>
        <Warning />
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

    const getEtherscanTxLinkElem = useCallback(
      (text = 'View on Etherscan') => {
        if (!txHash) return text;
        return (
          <Link
            href={
              chainId === CHAINS.Zhejiang
                ? ''
                : getEtherscanTxLink(chainId, txHash)
            }
          >
            {text}
          </Link>
        );
      },
      [chainId, txHash],
    );

    const etherscanTxLinkBlock = useMemo(() => {
      if (!txHash) return null;
      return (
        <LightText size="xxs" color="secondary" marginTop={38}>
          {getEtherscanTxLinkElem()}
        </LightText>
      );
    }, [getEtherscanTxLinkElem, txHash]);

    const operationWasSuccessfulText = useMemo(() => {
      switch (txOperation) {
        case TX_OPERATION.STAKING:
          return (
            <>
              Staking operation was successful. Transaction can be viewed on
              {getEtherscanTxLinkElem(' Etherscan')}
            </>
          );
        case TX_OPERATION.APPROVING:
          return 'Unlock successful!';
        case TX_OPERATION.WRAPPING:
          return (
            <>
              Wrapping operation was successful. Transaction can be viewed on
              {getEtherscanTxLinkElem(' Etherscan')}
            </>
          );
        case TX_OPERATION.UNWRAPPING:
          return (
            <>
              Unwrapping operation was successful. Transaction can be viewed on
              {getEtherscanTxLinkElem(' Etherscan')}
            </>
          );
        default:
          return 'Operation was successful';
      }
    }, [getEtherscanTxLinkElem, txOperation]);

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

    const oneInchLinkProps = use1inchLinkProps();
    const content = useMemo(() => {
      switch (txStage) {
        case TX_STAGE.IDLE:
          return null;
        case TX_STAGE.SIGN:
          return (
            <>
              {currentIconDict[TX_STAGE.SIGN]}
              <BoldText size="sm">
                You are now <LowercaseSpan>{operationText}</LowercaseSpan>{' '}
                {withOptionaLineBreak(formatBalanceString(amount, 4))}{' '}
                {amountToken}
              </BoldText>
              <LightText size="xs" color="secondary" marginTop={4}>
                {operationText} {formatBalanceString(amount, 4)} {amountToken}.{' '}
                {txOperation !== TX_OPERATION.APPROVING && (
                  <>
                    You will receive {formatBalanceString(willReceiveAmount, 4)}{' '}
                    {willReceiveAmountToken}
                  </>
                )}
              </LightText>
              <LightText size="xxs" color="secondary" marginTop={38}>
                Confirm this transaction in your wallet
              </LightText>
            </>
          );
        case TX_STAGE.BLOCK:
          return (
            <>
              {currentIconDict[TX_STAGE.BLOCK]}
              <BoldText size="sm">
                You are now <LowercaseSpan>{operationText}</LowercaseSpan>{' '}
                {withOptionaLineBreak(formatBalanceString(amount, 4))}{' '}
                {amountToken}
              </BoldText>
              <LightText size="xs" color="secondary" marginTop={4}>
                Awaiting block confirmation
              </LightText>
              {etherscanTxLinkBlock}
            </>
          );
        case TX_STAGE.SUCCESS:
          return balance ? (
            <>
              {currentIconDict[TX_STAGE.SUCCESS]}
              {txOperation !== TX_OPERATION.APPROVING && (
                <>
                  <BoldText size="sm">
                    Your new balance is <wbr />
                    {withOptionaLineBreak(balanceAsString)} {balanceToken}
                  </BoldText>
                  <LightText size="xs" color="secondary" marginTop={4}>
                    {operationWasSuccessfulText}
                  </LightText>
                  <ModalPoolBanners />
                </>
              )}
              {txOperation === TX_OPERATION.APPROVING && allowanceAmount && (
                <>
                  <BoldText size="sm">{operationWasSuccessfulText}</BoldText>
                  <LightText size="xs" color="secondary" marginTop={4}>
                    {formatBalance(allowanceAmount, 4)} stETH was unlocked to
                    wrap.
                  </LightText>
                  {etherscanTxLinkBlock}
                </>
              )}
            </>
          ) : null;
        case TX_STAGE.FAIL:
          return (
            <>
              {currentIconDict[TX_STAGE.FAIL]}
              <BoldText size="sm">Transaction Failed</BoldText>
              <LightText size="xs" color="secondary" marginTop={4}>
                {failedText ?? 'Something went wrong'}
              </LightText>
              {formRef &&
                formRef.current &&
                failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
                  <LightText size="xxs" color="secondary" marginTop={38}>
                    <StylableLink
                      onClick={() => formRef.current?.requestSubmit()}
                    >
                      Retry
                    </StylableLink>
                  </LightText>
                )}
            </>
          );
        case TX_STAGE.LIMIT:
          return (
            <>
              {currentIconDict[TX_STAGE.LIMIT]}
              <BoldText size="sm">Stake limit exhausted</BoldText>
              <LightText size="xs" color="secondary" marginTop={4}>
                {failedText ?? 'Something went wrong'}
              </LightText>
              {formRef &&
                formRef.current &&
                failedText !== ErrorMessage.NOT_ENOUGH_ETHER && (
                  <Grid>
                    <RetryButton
                      color="secondary"
                      onClick={() => formRef.current?.requestSubmit()}
                      size="xs"
                    >
                      Retry
                    </RetryButton>
                    <ButtonLinkSmall {...oneInchLinkProps}>
                      Swap on 1inch
                    </ButtonLinkSmall>
                  </Grid>
                )}
            </>
          );
      }
    }, [
      txStage,
      currentIconDict,
      operationText,
      withOptionaLineBreak,
      amount,
      amountToken,
      txOperation,
      willReceiveAmount,
      willReceiveAmountToken,
      etherscanTxLinkBlock,
      balance,
      balanceAsString,
      balanceToken,
      operationWasSuccessfulText,
      allowanceAmount,
      failedText,
      formRef,
      oneInchLinkProps,
    ]);

    return (
      <Modal
        {...modalProps}
        open={modalProps.open && !!content}
        onClose={isCloseButtonHidden ? undefined : modalProps.onClose}
      >
        {content}
      </Modal>
    );
  },
);
