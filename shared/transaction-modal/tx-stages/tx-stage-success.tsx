import { FC, PropsWithChildren } from 'react';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TransactionModalContent } from 'shared/transaction-modal/transaction-modal-content';
import { StageIconSuccess } from './icons';

type TxStageSuccessProps = {
  txHash?: string | null;
  description: React.ReactNode;
  title: React.ReactNode;
  showEtherscan?: boolean;
  onClickEtherscan?: React.MouseEventHandler<HTMLAnchorElement>;
};

export const TxStageSuccess: FC<PropsWithChildren<TxStageSuccessProps>> = (
  props,
) => {
  const {
    txHash,
    description,
    title,
    children,
    showEtherscan = true,
    onClickEtherscan,
  } = props;

  return (
    <TransactionModalContent
      icon={<StageIconSuccess />}
      title={title}
      description={description}
      footerHint={
        showEtherscan &&
        txHash && <TxLinkEtherscan txHash={txHash} onClick={onClickEtherscan} />
      }
      footer={children}
    />
  );
};
