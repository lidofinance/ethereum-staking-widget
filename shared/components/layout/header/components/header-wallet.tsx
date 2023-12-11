import { FC } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useSDK } from '@lido-sdk/react';
import { CHAINS, getChainColor } from '@lido-sdk/constants';
import { ThemeToggler } from '@lidofinance/lido-ui';
import NoSSRWrapper from '../../../no-ssr-wrapper';

import { dynamics } from 'config';
import { IPFSInfoBox } from 'features/ipfs/ipfs-info-box';
import { Button, Connect } from 'shared/wallet';

import { HeaderSettingsButton } from './header-settings-button';
import {
  HeaderWalletChainStyle,
  DotStyle,
  IPFSInfoBoxWrapper,
} from '../styles';

const HeaderWallet: FC = () => {
  const { active } = useWeb3();
  const { chainId } = useSDK();

  const chainName = CHAINS[chainId];
  const testNet = chainId !== CHAINS.Mainnet;
  const showNet = testNet && active;

  return (
    <NoSSRWrapper>
      {showNet && (
        <>
          <DotStyle />
          <HeaderWalletChainStyle $color={getChainColor(chainId)}>
            {chainName}
          </HeaderWalletChainStyle>
        </>
      )}
      {active ? (
        <Button data-testid="accountSectionHeader" />
      ) : (
        <Connect size="sm" />
      )}
      {dynamics.ipfsMode && <HeaderSettingsButton />}
      <ThemeToggler />
      {dynamics.ipfsMode && (
        <IPFSInfoBoxWrapper>
          <IPFSInfoBox />
        </IPFSInfoBoxWrapper>
      )}
    </NoSSRWrapper>
  );
};

export default HeaderWallet;
