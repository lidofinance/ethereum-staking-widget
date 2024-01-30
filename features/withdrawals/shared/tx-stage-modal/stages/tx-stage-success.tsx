import { FC, PropsWithChildren } from 'react';
import { useConnectorInfo } from 'reef-knot/web3-react';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
import { getStageIcon } from './icons';
import { TX_STAGE } from 'shared/transaction-modal';

type TxStageSuccessProps = {
  txHash: string | null;
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
  const { isLedger } = useConnectorInfo();

  return (
    <TxStageModalContent
      icon={getStageIcon(isLedger, TX_STAGE.SUCCESS)}
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
