import { Hash } from 'viem';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TokenSymbol } from 'utils/get-token-symbol';
import {
  NotificationContainer,
  NotificationTitle,
  NotificationList,
} from './styles';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

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

export const STGDepositTxStageSuccess = ({ txHash, amount, token }: Props) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={'Deposit request has been sent'}
      description={
        <>
          <span>
            Request to deposit <TxAmount amount={amount} symbol={token} /> has
            been sent.
          </span>
          <Notification />
        </>
      }
      showEtherscan
    />
  );
};
