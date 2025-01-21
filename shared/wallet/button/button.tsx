import { FC } from 'react';
import type { Address } from 'viem';
import { ButtonProps } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useDappStatus, useEthereumBalance } from 'modules/web3';

import { AddressBadge } from '../components/address-badge/address-badge';
import { useWalletModal } from '../wallet-modal/use-wallet-modal';

import {
  WalledButtonStyle,
  WalledButtonWrapperStyle,
  WalledButtonBalanceStyle,
  WalledButtonLoaderStyle,
} from './styles';

export const Button: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;

  const { isDappActive, isSwitchChainPending, address } = useDappStatus();

  const { openModal } = useWalletModal();
  const { data: balance, isLoading } = useEthereumBalance();

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={() => openModal({})}
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <WalledButtonBalanceStyle>
          {isLoading || isSwitchChainPending ? (
            <WalledButtonLoaderStyle />
          ) : (
            isDappActive && (
              <FormatToken
                amount={balance}
                symbol="ETH"
                showAmountTip={false}
              />
            )
          )}
        </WalledButtonBalanceStyle>
        <AddressBadge address={address as Address} />
      </WalledButtonWrapperStyle>
    </WalledButtonStyle>
  );
};
