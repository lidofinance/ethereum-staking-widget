import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const RisksOfStakingWithLido: FC = () => {
  return (
    <AccordionNavigatable
      id="lidoStakingRisks"
      summary="What are the risks of staking with Lido?"
    >
      <p>
        There exist a number of potential risks when staking using liquid
        staking protocols.
      </p>
      <ul>
        <li>
          <span>Smart contract security</span>
          <p>
            There is an inherent risk that Lido could contain a smart contract
            vulnerability or bug. The Lido code is open-sourced, audited and
            covered by an extensive bug bounty program to minimise this risk. To
            mitigate smart contract risks, all of the core Lido contracts are
            audited. Audit reports can be found{' '}
            <Link
              href="https://github.com/lidofinance/audits#lido-protocol-audits"
              data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingReports}
            >
              here
            </Link>
            . Besides, Lido is covered with a massive{' '}
            <Link
              href="https://immunefi.com/bounty/lido/"
              data-matomo={
                MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingImmunefiBugBounty
              }
            >
              Immunefi bug bounty program
            </Link>
            .
          </p>
        </li>
        <li>
          <span>Slashing risk</span>
          <p>
            Validators risk staking penalties, with up to 100% of staked funds
            at risk if validators fail. To minimise this risk, Lido stakes
            across multiple professional and reputable node operators with
            heterogeneous setups, with additional mitigation in the form of
            self-coverage.
          </p>
        </li>
        <li>
          <span>stToken price risk</span>
          <p>
            Users risk an exchange price of stTokens which is lower than
            inherent value due to withdrawal restrictions on Lido, making
            arbitrage and risk-free market-making impossible. The Lido DAO is
            driven to mitigate the above risks and eliminate them entirely to
            the extent possible. Despite this, they may still exist and, as
            such, it is our duty to communicate them.
          </p>
        </li>
      </ul>
      <p>
        The Lido DAO is driven to mitigate the above risks and eliminate them
        entirely to the extent possible. Despite this, they may still exist.
      </p>
    </AccordionNavigatable>
  );
};
