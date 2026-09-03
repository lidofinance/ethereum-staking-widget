import { FC } from 'react';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';

import { config } from 'config';
import { Link } from 'shared/components/link';
import { WITHDRAWALS_REQUEST_PATH } from 'consts/urls';

export const WhyOnlyWstethOnWithdrawal: FC = () => {
  const MULTICHAIN_PATH = `${config.rootOrigin}/lido-multichain`;
  const ECOSYSTEM_PATH = `${config.rootOrigin}/lido-ecosystem?criteria=and&tokens=wsteth`;

  return (
    <Accordion summary="Why, even though deposits are made in ETH/WETH, do I only receive wstETH on withdrawal?">
      <p>
        Withdrawals are processed in wstETH because this format allows the vault
        to reduce the time to claim and complete a withdrawal. By receiving
        wstETH, you will continue to accrue staking APR while you hold it. Also,
        wstETH is widely{' '}
        <OuterLink href={ECOSYSTEM_PATH}>accepted in DeFi</OuterLink>, so you
        can use it across protocols,{' '}
        <OuterLink href={MULTICHAIN_PATH}>
          bridge it to other networks
        </OuterLink>
        , or convert it into ETH through{' '}
        <Link href={WITHDRAWALS_REQUEST_PATH}>Lido withdrawals</Link>, or
        secondary markets.
      </p>
    </Accordion>
  );
};
