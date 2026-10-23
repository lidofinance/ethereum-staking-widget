import { FC } from 'react';
import { ButtonProps, useBreakpoint } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { useDappStatus, useEthereumBalance } from 'modules/web3';

import { AddressBadge } from 'shared/wallet/components/address-badge/address-badge';
import { useWalletModal } from 'shared/wallet/wallet-modal/use-wallet-modal';

import {
  WalletButtonStyle,
  WalletButtonWrapperStyle,
  WalletButtonBalanceStyle,
  WalletButtonLoaderStyle,
} from './styles';

export const WalletInfoButton: FC<ButtonProps> = (props) => {
  // onClick is stripped so a passed handler can't replace openModal
  const { onClick, ...rest } = props;

  const isMobile = useBreakpoint('md');
  const { isDappActive, address } = useDappStatus();

  const { openModal } = useWalletModal();
  const { data: balance, isLoading } = useEthereumBalance();

  return (
    <WalletButtonStyle
      size="sm"
      variant="text"
      color="secondary"
      onClick={() => openModal({})}
      $isAddPaddingLeft={!isLoading && !isDappActive && !isMobile}
      {...rest}
    >
      <WalletButtonWrapperStyle>
        <WalletButtonBalanceStyle>
          {isLoading ? (
            <WalletButtonLoaderStyle />
          ) : (
            isDappActive && (
              <FormatToken
                amount={balance}
                symbol="ETH"
                showAmountTip={false}
                data-testid="accountBalance"
              />
            )
          )}
        </WalletButtonBalanceStyle>
        <AddressBadge address={address} />
      </WalletButtonWrapperStyle>
    </WalletButtonStyle>
  );
};
