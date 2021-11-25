import { FC, useCallback } from 'react';
import { Modal, ModalProps } from '@lidofinance/lido-ui';
import { useLocalStorage } from '@lido-sdk/react';
import { helpers } from '@lido-sdk/web3-react';
import { STORAGE_TERMS_KEY } from 'config';
import {
  ConnectMetamask,
  ConnectWalletConnect,
  ConnectCoinbase,
  ConnectTrust,
  ConnectImToken,
  ConnectLedger,
  ConnectCoin98,
  // ConnectMathWallet,
} from './connectors';
import { Terms } from './terms';

export const ModalConnect: FC<ModalProps> = (props) => {
  const { onClose } = props;

  const [checked, setChecked] = useLocalStorage(STORAGE_TERMS_KEY, false);

  const handleChange = useCallback(() => {
    setChecked((currentValue) => !currentValue);
  }, [setChecked]);

  const common = {
    disabled: !checked,
    termsChecked: checked,
    onConnect: onClose,
  };

  const wallets = [
    <ConnectMetamask key="Metamask" {...common} />,
    <ConnectWalletConnect key="WalletConnect" {...common} />,
    <ConnectLedger key="Ledger" {...common} />,
    <ConnectCoinbase key="Coinbase" {...common} />,
    <ConnectTrust key="Trust" {...common} />,
    <ConnectImToken key="ImToken" {...common} />,
  ];

  const ConnectCoin98WithProps = <ConnectCoin98 key="Coin98" {...common} />;
  if (helpers.isCoin98Provider()) {
    wallets.unshift(ConnectCoin98WithProps);
  } else {
    wallets.push(ConnectCoin98WithProps);
  }

  // const ConnectMathWalletWithProps = (
  //   <ConnectMathWallet key="MathWallet" {...common} />
  // );
  // if (helpers.isMathWalletProvider()) {
  //   wallets.unshift(ConnectMathWalletWithProps);
  // } else {
  //   wallets.push(ConnectMathWalletWithProps);
  // }

  return (
    <Modal title="Connect wallet" {...props}>
      <Terms onChange={handleChange} checked={checked} />
      {wallets}
    </Modal>
  );
};
