import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';
import { CHAINS, getChainColor } from '@lido-sdk/constants';
import { ThemeToggler } from '@lidofinance/lido-ui';
import NoSSRWrapper from '../../../no-ssr-wrapper';

import { config } from 'config';

import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { Button, Connect } from 'shared/wallet';

import { HeaderSettingsButton } from './header-settings-button';
import {
  HeaderWalletChainStyle,
  DotStyle,
  IPFSInfoBoxOnlyDesktopWrapper,
} from '../styles';

const HeaderWallet: FC = () => {
  const router = useRouter();
  const { active } = useWeb3();
  const { account, chainId } = useSDK();

  const chainName = CHAINS[chainId];
  const testNet = chainId !== CHAINS.Mainnet;
  const showNet = testNet && active;
  const queryTheme = router?.query?.theme;

  const chainColor = useMemo(() => {
    try {
      return getChainColor(chainId);
    } catch {
      return getChainColor(1);
    }
  }, [chainId]);

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
      {active || account ? (
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
