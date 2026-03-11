import { Hash } from 'viem';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { getTokenDecimals } from 'utils/token-decimals';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { type TokenSymbol } from 'consts/tokens';
import {
  NotificationContainer,
  NotificationTitle,
  NotificationList,
} from './styles';

type Props = {
  txHash?: Hash;
  amount: bigint;
  token: TokenSymbol;
};

const Notification = () => (
  <NotificationContainer>
    <NotificationTitle>Please note that:</NotificationTitle>
    <NotificationList>
      <li>Deposits process in ~24h</li>
      <li>LP tokens are claimable in Lido UI</li>
      <li>Unclaimed tokens still accrue rewards</li>
    </NotificationList>
  </NotificationContainer>
);

export const DepositTxStageSuccess = ({ txHash, amount, token }: Props) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={'Deposit request has been sent'}
      description={
        <>
          <span>
            Request to deposit{' '}
            <TxAmount
              amount={amount}
              symbol={token}
              decimals={getTokenDecimals(token)}
            />{' '}
            has been sent.
          </span>
          <Notification />
        </>
      }
      showEtherscan
    />
  );
};
