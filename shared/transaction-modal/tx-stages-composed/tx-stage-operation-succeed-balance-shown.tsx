import type { Hash } from 'viem';
import styled from 'styled-components';

import { useDappStatus } from 'modules/web3';

import { useTokenAddress } from 'shared/hooks/use-token-address';

import { getTokenDecimals } from 'utils/token-decimals';

import { TxAmount } from '../tx-stages-parts/tx-amount';
import { SuccessText } from '../tx-stages-parts/success-text';
import { TxStageSuccess } from '../tx-stages-basic';
import { TokenToWallet } from '../../components';

export const BalanceContainer = styled.span`
  display: inline-block;
  white-space: nowrap;
`;

type TxStageOperationSucceedBalanceShownProps = {
  balance?: bigint;
  balanceToken: string;
  operationText: string;
  txHash?: Hash;
  footer?: React.ReactNode;
};

export const TxStageOperationSucceedBalanceShown = ({
  balance,
  balanceToken,
  operationText,
  txHash,
  footer,
}: TxStageOperationSucceedBalanceShownProps) => {
  const { walletChainId } = useDappStatus();
  const tokenToWalletAddress = useTokenAddress(balanceToken);

  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          {/* the balance is missing when its read failed after the tx settled:
              the operation is still a success, only the amount is dropped */}
          {balance !== undefined ? (
            <>Your new balance is </>
          ) : (
            <>Your {balanceToken} balance was updated </>
          )}
          <wbr />
          <BalanceContainer>
            {balance !== undefined && (
              <TxAmount
                amount={balance}
                symbol={balanceToken}
                decimals={getTokenDecimals(balanceToken)}
              />
            )}
            <TokenToWallet
              data-testid="txSuccessAddToken"
              address={tokenToWalletAddress}
            />
          </BalanceContainer>
        </>
      }
      description={
        <SuccessText
          operationText={operationText}
          txHash={txHash}
          chainId={walletChainId}
        />
      }
      showEtherscan={false}
      footer={footer}
    />
  );
};
