import { FC } from 'react';
import { useWeb3 } from '@reef-knot/web3-react';
import { CHAINS } from '@lido-sdk/constants';
import { Button, Connect } from 'shared/wallet';
import { HeaderWalletChainStyle, DotStyle } from '../styles';
import { ThemeToggler } from '@lidofinance/lido-ui';

import { getChainColor } from 'customSdk/chains';

const HeaderWallet: FC = () => {
  const { active, chainId } = useWeb3();

  if (!chainId) return null;

  const chainName = CHAINS[chainId];
  const testNet = chainId !== CHAINS.Mainnet;
  const showNet = testNet && active;

  return (
    <>
      {showNet && (
        <>
          <DotStyle />
          <HeaderWalletChainStyle $color={getChainColor(chainId)}>
            {chainName}
          </HeaderWalletChainStyle>
        </>
      )}
      {active ? <Button /> : <Connect size="sm" />}
      <ThemeToggler />
    </>
  );
};

export default HeaderWallet;
