import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';

import { CHAINS as legacySDKCHAINS, getChainColor } from '@lido-sdk/constants';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { CHAINS } from 'consts/chains';

import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { useDappStatus } from 'modules/web3';
import { Button, Connect } from 'shared/wallet';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { HeaderSettingsButton } from './header-settings-button';
import {
  HeaderWalletChainStyle,
  DotStyle,
  IPFSInfoBoxOnlyDesktopWrapper,
} from '../styles';
import { ThemeTogglerStyled } from './styles';
import { ChainSwitcher } from './chain-switcher/chain-switcher';

const HeaderWallet: FC = () => {
  const router = useRouter();
  const { defaultChain: defaultChainId } = useUserConfig();
  const { isDappActive, address, walletChainId } = useDappStatus();

  let chainName = legacySDKCHAINS[walletChainId || defaultChainId];
  if (!chainName && walletChainId === CHAINS.OptimismSepolia) {
    chainName = 'Optimism Sepolia';
  }

  const testNet = !(
    walletChainId === legacySDKCHAINS.Mainnet ||
    walletChainId === CHAINS.Optimism
  );
  const showNet = testNet && isDappActive;
  const queryTheme = router?.query?.theme;

  const chainColor = useMemo(() => {
    try {
      return getChainColor(walletChainId || defaultChainId);
    } catch {
      return getChainColor(defaultChainId);
    }
  }, [walletChainId, defaultChainId]);

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
