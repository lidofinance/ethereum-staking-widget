import { FC } from 'react';
import { ButtonProps, useBreakpoint } from '@lidofinance/lido-ui';

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

  const isMobile = useBreakpoint('md');
  const { isDappActive, address } = useDappStatus();

  const { openModal } = useWalletModal();
  const { data: balance, isLoading } = useEthereumBalance();

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={() => openModal({})}
      $isAddPaddingLeft={!isLoading && !isDappActive && !isMobile}
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <WalledButtonBalanceStyle>
          {isLoading ? (
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
        <AddressBadge address={address as `0x${string}`} />
      </WalledButtonWrapperStyle>
    </WalledButtonStyle>
  );
};
