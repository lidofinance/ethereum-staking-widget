import { useCallback, useEffect } from 'react';
import {
  ButtonIcon,
  Modal,
  Identicon,
  External,
  Copy,
  Address,
} from '@lidofinance/lido-ui';
import { useConnectorInfo, useDisconnect } from 'reef-knot/core-react';

import { config } from 'config';
import type { ModalComponentType } from 'providers/modal-provider';
import { useCopyToClipboard } from 'shared/hooks';
import { useDappStatus } from 'modules/web3';
import { getEtherscanAddressLink } from 'utils/etherscan';
import { openWindow } from 'utils/open-window';
import { trackMatomoEvent } from 'utils/track-matomo-event';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';

import {
  WalletModalContentStyle,
  WalletModalConnectedStyle,
  WalletModalConnectorStyle,
  WalletModalDisconnectStyle,
  WalletModalAccountStyle,
  WalletModalAddressStyle,
  WalletModalActionsStyle,
} from './styles';

export const WalletModal: ModalComponentType = ({ onClose, ...props }) => {
  const { address, walletChainId } = useDappStatus();
  const { connectorName } = useConnectorInfo();
  const { disconnect } = useDisconnect();

  const handleDisconnect = useCallback(() => {
    disconnect?.();
    trackMatomoEvent(MATOMO_CLICK_EVENTS_TYPES.disconnectWalletManually);
    onClose?.();
  }, [disconnect, onClose]);

  const handleCopy = useCopyToClipboard(address ?? '');
  const handleEtherscan = useCallback(() => {
    // This component is wrapped by SupportL1Chains,
    // but not wrapped by SupportL2Chains (the chainId will never be a L2 network).
    // This is currently the fastest solution.
    const link = getEtherscanAddressLink(
      walletChainId ?? config.defaultChain,
      address ?? '',
    );
    openWindow(link);
  }, [address, walletChainId]);

  useEffect(() => {
    // Close the modal if a wallet was somehow disconnected while the modal was open
    if (address == null || address.length === 0) {
      onClose?.();
    }
  }, [address, onClose]);

  useEffect(() => {
    // Close the modal if a wallet was somehow disconnected while the modal was open
    if (address == null || address.length === 0) {
      onClose?.();
    }
  }, [address, onClose]);

  return (
    <Modal title="Account" onClose={onClose} {...props}>
      <WalletModalContentStyle>
        <WalletModalConnectedStyle>
          {connectorName && (
            <WalletModalConnectorStyle data-testid="providerName">
              Connected with {connectorName}
            </WalletModalConnectorStyle>
          )}

          {disconnect && (
            <WalletModalDisconnectStyle
              size="xs"
              variant="outlined"
              onClick={handleDisconnect}
              data-testid="disconnectBtn"
            >
              Disconnect
            </WalletModalDisconnectStyle>
          )}
        </WalletModalConnectedStyle>

        <WalletModalAccountStyle>
          <Identicon address={address ?? ''} />
          <WalletModalAddressStyle>
            <Address
              data-testid="connectedAddress"
              address={address ?? ''}
              symbols={6}
            />
          </WalletModalAddressStyle>
        </WalletModalAccountStyle>

        <WalletModalActionsStyle>
          <ButtonIcon
            data-testid="copyAddressBtn"
            onClick={handleCopy}
            icon={<Copy />}
            size="xs"
            variant="ghost"
          >
            Copy address
          </ButtonIcon>
          <ButtonIcon
            data-testid="etherscanBtn"
            onClick={handleEtherscan}
            icon={<External />}
            size="xs"
            variant="ghost"
          >
            View on Etherscan
          </ButtonIcon>
        </WalletModalActionsStyle>
      </WalletModalContentStyle>
    </Modal>
  );
};
