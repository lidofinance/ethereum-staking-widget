import { FC, memo, useCallback, useMemo } from 'react';
import { Link, Modal, ModalProps } from '@lidofinance/lido-ui';
import {
  BoldText,
  FailIcon,
  IconWrapper,
  LightText,
  SuccessIcon,
  TxLoader,
} from './styles';
import { css } from 'styled-components';
import { getEtherscanTxLink } from '@lido-sdk/helpers';
import { useSDK } from '@lido-sdk/react';
import { BigNumber } from 'ethers';
import { formatEther } from '@ethersproject/units';

export enum TX_STAGE {
  IDLE,
  SIGN,
  BLOCK,
  SUCCESS,
  FAIL,
}

interface StakeModalProps extends ModalProps {
  txStage: TX_STAGE;
  amount: string;
  txHash?: string;
  balance?: BigNumber;
}

const StakeModal: FC<StakeModalProps> = ({
  txStage,
  txHash,
  amount,
  balance,
  ...modalProps
}) => {
  const { chainId } = useSDK();

  const balanceString = useMemo(
    () => (balance ? formatEther(balance) : ''),
    [balance],
  );

  // inserts new lines in front of long numbers so that the currency symbol remains on the same line
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

  const content = useMemo(() => {
    switch (txStage) {
      case TX_STAGE.IDLE:
        return null;
      case TX_STAGE.SIGN:
        return (
          <>
            <TxLoader size="large" />
            <BoldText>
              You are now staking {withOptionaLineBreak(amount)} ETH
            </BoldText>
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              Staking {amount} ETH. You will receive {amount} stETH
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
              You are now staking {withOptionaLineBreak(amount)} ETH
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
      case TX_STAGE.SUCCESS:
        return txHash && balance ? (
          <>
            <IconWrapper>
              <SuccessIcon />
            </IconWrapper>
            {balance && (
              <BoldText>
                Your new balance is <wbr />
                {withOptionaLineBreak(balanceString)} stETH
              </BoldText>
            )}
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              Staking operation was successful
            </LightText>
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
                {withOptionaLineBreak(balanceString)} stETH
              </BoldText>
            )}
            <LightText
              size="xxs"
              color="secondary"
              css={css`
                margin-top: 4px;
              `}
            >
              Staking operation failed
            </LightText>
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
    }
  }, [
    txStage,
    withOptionaLineBreak,
    amount,
    txHash,
    chainId,
    balance,
    balanceString,
  ]);

  return <Modal {...modalProps}>{content}</Modal>;
};

export default memo(StakeModal);
