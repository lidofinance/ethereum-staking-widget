import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { AmountBanner } from 'shared/banners/amount-banners';
import { useDappStatus } from 'modules/web3';

import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { getChainColor } from 'utils/get-chain-color';

import { ChainSwitcher } from '../chain-switcher';
import { WalletInfoButton } from '../wallet-info-button';
import { HeaderSettingsButton } from './header-settings-button';

import {
  HeaderWalletChainLabel,
  IPFSInfoBoxOnlyDesktopWrapper,
  AmountBannerOnlyDesktopWrapper,
  HeaderActionsStyle,
  ThemeTogglerStyled,
  ConnectButtonStyled,
} from './styles';

export const HeaderActions: FC = () => {
  const router = useRouter();
  const { defaultChain: defaultChainId } = useUserConfig();
  const { isDappActive, address, walletChainId, isTestnet } = useDappStatus();

  const chainName = CHAINS[walletChainId || defaultChainId];
  const showChainLabel = isTestnet && isDappActive;
  const queryTheme = router?.query?.theme;

  const chainColor = useMemo(
    () => getChainColor(walletChainId || defaultChainId),
    [walletChainId, defaultChainId],
  );

  return (
    <HeaderActionsStyle>
      <NoSSRWrapper>
        {showChainLabel && (
          <HeaderWalletChainLabel $color={chainColor}>
            {chainName}
          </HeaderWalletChainLabel>
        )}
        {address ? (
          <>
            <ChainSwitcher />
            <WalletInfoButton data-testid="accountSectionHeader" />
          </>
        ) : (
          <ConnectButtonStyled size="sm" />
        )}
        {config.ipfsMode && <HeaderSettingsButton />}
        {!queryTheme && <ThemeTogglerStyled data-testid="themeToggler" />}
        {config.ipfsMode && (
          <IPFSInfoBoxOnlyDesktopWrapper>
            <IPFSInfoBox />
          </IPFSInfoBoxOnlyDesktopWrapper>
        )}
        <AmountBannerOnlyDesktopWrapper>
          <AmountBanner isDismissible placement="connect_wallet" />
        </AmountBannerOnlyDesktopWrapper>
      </NoSSRWrapper>
    </HeaderActionsStyle>
  );
};
