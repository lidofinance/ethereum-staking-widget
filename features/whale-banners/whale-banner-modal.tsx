import { Modal } from '@lidofinance/lido-ui';
import type { ModalComponentType } from 'providers/modal-provider';
import { WhaleBanner } from './whale-banner';
import type { WhaleBannerConfig } from './types';

type WhaleBannerModalProps = {
  bannerConfig: WhaleBannerConfig;
};

export const WhaleBannerModal: ModalComponentType<WhaleBannerModalProps> = ({
  onClose,
  bannerConfig,
  ...props
}) => {
  return (
    <Modal title="A message for you" onClose={onClose} {...props}>
      <WhaleBanner config={bannerConfig} />
    </Modal>
  );
};
