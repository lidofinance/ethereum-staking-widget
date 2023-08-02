import { memo } from 'react';
import { Modal, ModalProps } from '@lidofinance/lido-ui';
import { TxStageModalContent } from 'shared/components/tx-stage-modal-content';

type TxStageModalShapeProps = ModalProps &
  React.ComponentProps<typeof TxStageModalContent>;

export const TxStageModalShape = memo((props: TxStageModalShapeProps) => {
  const { icon, title, description, footer, footerHint, ...modalProps } = props;
  return (
    <Modal {...modalProps}>
      <TxStageModalContent
        icon={icon}
        title={title}
        description={description}
        footer={footer}
        footerHint={footerHint}
      />
    </Modal>
  );
});
