import { Hash } from 'viem';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TOKEN_DISPLAY_NAMES } from 'utils/getTokenDisplayName';
import { NotificationContainer, NotificationTitle } from './styles';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';

type Props = {
  txHash?: Hash;
  amount: bigint;
  token: TOKEN_DISPLAY_NAMES;
};

const Notification = () => (
  <NotificationContainer>
    <NotificationTitle>Please note that:</NotificationTitle>
    <ol>
      <li>Deposits process in ~24h</li>
      <li>LP tokens are claimable in Lido UI</li>
      <li>Unclaimed tokens still accrue rewards</li>
    </ol>
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
