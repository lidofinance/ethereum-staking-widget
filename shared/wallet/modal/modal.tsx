import {
  ButtonIcon,
  Modal as DefaultModal,
  ModalProps,
  Identicon,
  External,
  Copy,
  Address,
} from '@lidofinance/lido-ui';
import { useEtherscanOpen, useSDK } from '@lido-sdk/react';
import { useConnectorInfo, useDisconnect } from '@reef-knot/web3-react';
import { useCopyToClipboard } from 'shared/hooks';
import { FC, useCallback } from 'react';
import {
  WalletModalContentStyle,
  WalletModalConnectedStyle,
  WalletModalConnectorStyle,
  WalletModalDisconnectStyle,
  WalletModalAccountStyle,
  WalletModalAddressStyle,
  WalletModalActionsStyle,
} from './styles';

export const Modal: FC<ModalProps> = (props) => {
  const { onClose } = props;
  const { account } = useSDK();
  const { providerName } = useConnectorInfo();
  const { disconnect } = useDisconnect();

  const handleDisconnect = useCallback(() => {
    disconnect?.();
    onClose?.();
  }, [disconnect, onClose]);

  const handleCopy = useCopyToClipboard(account ?? '');
  const handleEtherscan = useEtherscanOpen(account ?? '', 'address');

  return (
    <DefaultModal title="Account" {...props}>
      <WalletModalContentStyle>
        <WalletModalConnectedStyle>
          {providerName && (
            <WalletModalConnectorStyle>
              Connected with {providerName}
            </WalletModalConnectorStyle>
          )}

          {disconnect && (
            <WalletModalDisconnectStyle
              size="xs"
              variant="outlined"
              onClick={handleDisconnect}
            >
              Disconnect
            </WalletModalDisconnectStyle>
          )}
        </WalletModalConnectedStyle>

        <WalletModalAccountStyle>
          <Identicon address={account ?? ''} />
          <WalletModalAddressStyle>
            <Address address={account ?? ''} symbols={6} />
          </WalletModalAddressStyle>
        </WalletModalAccountStyle>

        <WalletModalActionsStyle>
          <ButtonIcon
            onClick={handleCopy}
            icon={<Copy />}
            size="xs"
            variant="ghost"
          >
            Copy address
          </ButtonIcon>
          <ButtonIcon
            onClick={handleEtherscan}
            icon={<External />}
            size="xs"
            variant="ghost"
          >
            View on Etherscan
          </ButtonIcon>
        </WalletModalActionsStyle>
      </WalletModalContentStyle>
    </DefaultModal>
  );
};
