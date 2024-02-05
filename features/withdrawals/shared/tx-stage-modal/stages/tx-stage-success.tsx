import { FC, PropsWithChildren } from 'react';

import { TxLinkEtherscan } from 'shared/components/tx-link-etherscan';
import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';
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
    <TxStageModalContent
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
