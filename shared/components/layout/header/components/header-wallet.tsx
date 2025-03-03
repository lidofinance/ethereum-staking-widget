import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';

import { CHAINS } from '@lidofinance/lido-ethereum-sdk/common';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { useDappStatus } from 'modules/web3';
import { Button, Connect } from 'shared/wallet';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { getChainColor } from 'utils/get-chain-color';

import {
  HeaderWalletChainStyle,
  DotStyle,
  IPFSInfoBoxOnlyDesktopWrapper,
} from '../styles';

import { ChainSwitcher } from './chain-switcher/chain-switcher';
import { HeaderSettingsButton } from './header-settings-button';
import { ThemeTogglerStyled } from './styles';

const HeaderWallet: FC = () => {
  const router = useRouter();
  const { defaultChain: defaultChainId } = useUserConfig();
  const { isDappActive, address, walletChainId, isTestnet } = useDappStatus();

  const chainName = CHAINS[walletChainId || defaultChainId];
  const showNet = isTestnet && isDappActive;
  const queryTheme = router?.query?.theme;

  const chainColor = useMemo(
    () => getChainColor(walletChainId || defaultChainId),
    [walletChainId, defaultChainId],
  );

  return (
    <NoSSRWrapper>
      {showNet && (
        <>
          <DotStyle />
          <HeaderWalletChainStyle $color={chainColor}>
            {chainName}
          </HeaderWalletChainStyle>
        </>
      )}
      {address ? (
        <>
          <ChainSwitcher />
          <Button data-testid="accountSectionHeader" />
        </>
      ) : (
        <Connect size="sm" />
      )}
      {config.ipfsMode && <HeaderSettingsButton />}
      {!queryTheme && <ThemeTogglerStyled data-testid="themeToggler" />}
      {config.ipfsMode && (
        <IPFSInfoBoxOnlyDesktopWrapper>
          <IPFSInfoBox />
        </IPFSInfoBoxOnlyDesktopWrapper>
      )}
    </NoSSRWrapper>
  );
};

export default HeaderWallet;
