import {
  ButtonIcon,
  Modal,
  Identicon,
  External,
  Copy,
  Address,
} from '@lidofinance/lido-ui';
import type { ModalComponentType } from 'providers/modal-provider';
import { useEtherscanOpen, useSDK } from '@lido-sdk/react';
import { useConnectorInfo, useDisconnect } from 'reef-knot/web3-react';
import { useCopyToClipboard } from 'shared/hooks';
import { useCallback } from 'react';
import { useDisconnect as useDisconnectWagmi } from 'wagmi';
import {
  WalletModalContentStyle,
  WalletModalConnectedStyle,
  WalletModalConnectorStyle,
  WalletModalDisconnectStyle,
  WalletModalAccountStyle,
  WalletModalAddressStyle,
  WalletModalActionsStyle,
} from './styles';

export const WalletModal: ModalComponentType = (props) => {
  const { onClose } = props;
  const { account } = useSDK();
  const { providerName } = useConnectorInfo();
  const { disconnect } = useDisconnect();
  const { disconnect: wagmiDisconnect } = useDisconnectWagmi();

  const handleDisconnect = useCallback(() => {
    // disconnect wallets connected through web3-react connectors
    disconnect?.();
    // disconnect wallets connected through wagmi connectors
    wagmiDisconnect();
    onClose?.();
  }, [disconnect, onClose, wagmiDisconnect]);

  const handleCopy = useCopyToClipboard(account ?? '');
  const handleEtherscan = useEtherscanOpen(account ?? '', 'address');

  return (
    <Modal title="Account" {...props}>
      <WalletModalContentStyle>
        <WalletModalConnectedStyle>
          {providerName && (
            <WalletModalConnectorStyle data-testid="providerName">
              Connected with {providerName}
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
