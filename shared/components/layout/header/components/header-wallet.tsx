import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';

import { CHAINS, getChainColor } from '@lido-sdk/constants';
import { ThemeToggler } from '@lidofinance/lido-ui';

import { config } from 'config';
import { useUserConfig } from 'config/user-config';

import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { useDappStatuses } from 'shared/hooks/use-dapp-statuses';
import { Button, Connect } from 'shared/wallet';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { HeaderSettingsButton } from './header-settings-button';
import {
  HeaderWalletChainStyle,
  DotStyle,
  IPFSInfoBoxOnlyDesktopWrapper,
} from '../styles';

const HeaderWallet: FC = () => {
  const router = useRouter();
  const { chainId, address } = useAccount();
  const { defaultChain: defaultChainId } = useUserConfig();
  const { isDappActive } = useDappStatuses();

  const chainName = CHAINS[chainId || defaultChainId];
  const testNet = chainId !== CHAINS.Mainnet;
  const showNet = testNet && isDappActive;
  const queryTheme = router?.query?.theme;

  const chainColor = useMemo(() => {
    try {
      return getChainColor(chainId || defaultChainId);
    } catch {
      return getChainColor(defaultChainId);
    }
  }, [chainId, defaultChainId]);

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
        <Button data-testid="accountSectionHeader" />
      ) : (
        <Connect size="sm" />
      )}
      {config.ipfsMode && <HeaderSettingsButton />}
      {!queryTheme && <ThemeToggler data-testid="themeToggler" />}
      {config.ipfsMode && (
        <IPFSInfoBoxOnlyDesktopWrapper>
          <IPFSInfoBox />
        </IPFSInfoBoxOnlyDesktopWrapper>
      )}
    </NoSSRWrapper>
  );
};

export default HeaderWallet;
