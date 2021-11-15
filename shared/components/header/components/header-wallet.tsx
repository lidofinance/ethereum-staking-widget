import { FC } from 'react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { useSDK } from '@lido-sdk/react';
import { CHAINS, getChainColor } from '@lido-sdk/constants';
import { Button, Connect } from 'shared/wallet';
import { HeaderWalletChainStyle, DotStyle } from '../styles';
import { ThemeToggler } from './theme-toggler/theme-toggler';

const HeaderWallet: FC = () => {
  const { active } = useWeb3();
  const { chainId } = useSDK();

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
