import { FC, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { config } from 'config';
import {
  RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  useFeatureFlag,
} from 'config/feature-flags';
import { useUserConfig } from 'config/user-config';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { AmountBanner } from 'shared/banners/amount-banners';
import { useDappStatus } from 'modules/web3';

import { getChainColor } from 'utils/get-chain-color';

import { ChainSwitcher } from '../chain-switcher';
import { WalletInfoButton } from '../wallet-info-button';
import { HeaderSettingsButton } from './header-settings-button';

import {
  HeaderWalletChainLabel,
  BannerOnlyDesktopWrapper,
  HeaderActionsStyle,
  ThemeTogglerStyled,
  ConnectButtonStyled,
} from './styles';

export const HeaderActions: FC = () => {
  const [searchParams] = useSearchParams();
  const { rpcSettingsPageOnInfraIsEnabled } = useFeatureFlag(
    RPC_SETTINGS_PAGE_ON_INFRA_IS_ENABLED,
  );
  const { defaultChain: defaultChainId } = useUserConfig();
  const { isDappActive, address, walletChainId, isTestnet } = useDappStatus();

  const chainName = CHAINS[walletChainId || defaultChainId];
  const showChainLabel = isTestnet && isDappActive;
  const queryTheme = searchParams.get('theme');

  const chainColor = useMemo(
    () => getChainColor(walletChainId || defaultChainId),
    [walletChainId, defaultChainId],
  );

  return (
    <HeaderActionsStyle>
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
      {(config.ipfsMode || rpcSettingsPageOnInfraIsEnabled) && (
        <HeaderSettingsButton />
      )}
      {!queryTheme && <ThemeTogglerStyled data-testid="themeToggler" />}
      {config.ipfsMode && (
        <BannerOnlyDesktopWrapper>
          <IPFSInfoBox />
        </BannerOnlyDesktopWrapper>
      )}
      <BannerOnlyDesktopWrapper>
        <AmountBanner isDismissible placement="connect_wallet" />
      </BannerOnlyDesktopWrapper>
    </HeaderActionsStyle>
  );
};
