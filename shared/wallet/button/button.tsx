import { FC } from 'react';
import { useAccount } from 'wagmi';
import { ButtonProps, useBreakpoint } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useDappStatus } from 'shared/hooks/use-dapp-status';

import { AddressBadge } from '../components/address-badge/address-badge';
import { useWalletModal } from '../wallet-modal/use-wallet-modal';

import {
  WalledButtonStyle,
  WalledButtonWrapperStyle,
  WalledButtonBalanceStyle,
  WalledButtonLoaderStyle,
} from './styles';
import { useEthereumBalance } from 'shared/hooks/use-balance';

export const Button: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;

  const isMobile = useBreakpoint('md');
  const { address } = useAccount();
  const { isDappActiveAndNetworksMatched } = useDappStatus();

  const { openModal } = useWalletModal();
  const { data: balance, isLoading } = useEthereumBalance();

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={() => openModal({})}
      $isAddPaddingLeft={
        !isLoading && !isDappActiveAndNetworksMatched && !isMobile
      }
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <WalledButtonBalanceStyle>
          {isLoading ? (
            <WalledButtonLoaderStyle />
          ) : (
            isDappActiveAndNetworksMatched && (
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
