import { TOKENS } from '@lido-sdk/constants';
import {
  useEthereumBalance,
  useSDK,
  useSTETHBalance,
  useTokenAddress,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';
import { LIDO_APR_TOOLTIP_TEXT } from 'config';
import { memo } from 'react';
import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useEthApr, useLidoApr } from 'shared/hooks';
import { CardAccount, CardBalance, CardRow, Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { LidoAprStyled, StyledCard } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const eth = useEthereumBalance();
  const steth = useSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const lidoApr = useLidoApr();
  const etrApr = useEthApr();

  return (
    <StyledCard {...props}>
      <CardRow>
        <CardBalance
          title="Available to stake"
          loading={eth.initialLoading}
          value={<FormatToken amount={eth.data} symbol="ETH" />}
        />
        <CardAccount account={account} />
      </CardRow>
      <Divider />
      <CardRow>
        <CardBalance
          small
          title="Staked amount"
          loading={steth.initialLoading}
          value={
            <>
              <FormatToken amount={steth.data} symbol="stETH" />
              <TokenToWallet address={stethAddress} />
            </>
          }
        />
        <CardBalance
          small
          title={
            <>
              Lido APR{' '}
              {etrApr && etrApr.data && (
                <Tooltip
                  placement="bottom"
                  title={
                    /* String.replaceAll presumably causes exceptions
                    in dApp browsers of some mobile devices */
                    LIDO_APR_TOOLTIP_TEXT.replace(
                      /\$\{apr.eth}/g,
                      etrApr.data as string,
                    )
                  }
                >
                  <Question />
                </Tooltip>
              )}
            </>
          }
          loading={lidoApr.initialLoading}
          value={<LidoAprStyled>{lidoApr.data}%</LidoAprStyled>}
        />
      </CardRow>
    </StyledCard>
  );
};

export const Wallet: WalletComponentType = memo((props) => {
  const { active } = useWeb3();
  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
