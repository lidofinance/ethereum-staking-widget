import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { config } from 'config';

export const WhyReceiveWstethOnWithdrawal: FC = () => {
  return (
    <Accordion summary="Why, even though deposits are made in ETH/WETH/wstETH, do I only receive wstETH on withdrawal?">
      <p>
        Withdrawals are processed in wstETH because this format allows the vault
        to reduce the time to claim and complete a withdrawal. By receiving
        wstETH, you will continue to accrue staking APR while you hold it. Also,
        wstETH is widely{' '}
        <Link
          href={`${config.rootOrigin}/lido-ecosystem?criteria=and&tokens=wsteth`}
        >
          accepted in DeFi
        </Link>
        , so you can use it across protocols,{' '}
        <Link href={`${config.rootOrigin}/lido-multichain`}>
          bridge it to other networks
        </Link>
        , or convert it into ETH through{' '}
        <Link href={`${config.selfOrigin}/withdrawals/request`}>
          Lido withdrawals
        </Link>
        , or secondary markets.
      </p>
    </Accordion>
  );
};
