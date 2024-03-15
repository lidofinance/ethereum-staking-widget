import { useCallback } from 'react';
import {
  ButtonIcon,
  Modal,
  Identicon,
  External,
  Copy,
  Address,
} from '@lidofinance/lido-ui';
import { useEtherscanOpen } from '@lido-sdk/react';
import { useConnectorInfo, useDisconnect } from 'reef-knot/core-react';
import { useWeb3 } from 'reef-knot/web3-react';

import type { ModalComponentType } from 'providers/modal-provider';
import { useCopyToClipboard } from 'shared/hooks';
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
  const { account } = useWeb3();
  const { connectorName } = useConnectorInfo();
  const { disconnect } = useDisconnect();

  const handleDisconnect = useCallback(() => {
    disconnect?.();
    onClose?.();
  }, [disconnect, onClose]);

  const handleCopy = useCopyToClipboard(account ?? '');
  const handleEtherscan = useEtherscanOpen(account ?? '', 'address');

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
          <Identicon address={account ?? ''} />
          <WalletModalAddressStyle>
            <Address
              data-testid="connectedAddress"
              address={account ?? ''}
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
