import { FC } from 'react';
import { useAccount } from 'wagmi';
import { ButtonProps, useBreakpoint } from '@lidofinance/lido-ui';
import { useEthereumBalance } from '@lido-sdk/react';

import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { FormatToken } from 'shared/formatters';
import { useIsConnectedWalletAndSupportedChain } from 'shared/hooks/use-is-connected-wallet-and-supported-chain';

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

  const isActiveWallet = useIsConnectedWalletAndSupportedChain();
  const { address } = useAccount();
  const isMobile = useBreakpoint('md');

  const { openModal } = useWalletModal();
  const { data: balance, initialLoading } = useEthereumBalance(
    undefined,
    STRATEGY_LAZY,
  );

  return (
    <WalledButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={() => openModal({})}
      style={
        !initialLoading && !isActiveWallet && !isMobile
          ? { paddingLeft: '9px' }
          : {}
      }
      {...rest}
    >
      <WalledButtonWrapperStyle>
        <WalledButtonBalanceStyle>
          {initialLoading ? (
            <WalledButtonLoaderStyle />
          ) : (
            isActiveWallet && (
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
