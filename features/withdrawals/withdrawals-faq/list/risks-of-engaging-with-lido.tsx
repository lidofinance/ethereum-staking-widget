import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const RisksOfEngagingWithLido: FC = () => {
  return (
    <AccordionNavigatable
      id="lidoEngagingRisks"
      summary="What are the risks of engaging with the Lido protocol?"
      defaultExpanded
    >
      <p>
        There exist a number of potential risks when staking using the Lido
        protocol. Some of these risks include:
      </p>
      <ul>
        <li>
          <span>Smart contract security</span>
          <p>
            There is an inherent risk that Lido Protocol could contain a smart
            contract vulnerability or bug. The Lido code is open-sourced,
            audited and covered by an extensive{' '}
            <Link
              href="https://immunefi.com/bounty/lido/"
              data-matomo={
                MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingImmunefiBugBounty
              }
            >
              Immunefi bug bounty program
            </Link>{' '}
            to minimise this risk. To mitigate smart contract risks, all of the
            core Lido contracts are audited. Audit reports can be found{' '}
            <Link
              href="https://github.com/lidofinance/audits#lido-protocol-audits"
              data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqRisksOfStakingReports}
            >
              here
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
            inherent value due to withdrawal restrictions on Lido protocol,
            making arbitrage and risk-free market-making impossible.
          </p>
        </li>
      </ul>
      <p>
        For further information and details about these and other potential
        risks, please read carefully the{' '}
        <Link href={'https://lido.fi/terms-of-use'}>Terms of Use</Link>.
      </p>
      <p>
        Always conduct your own research and consult your own professional
        advisors to understand all potential risks before participating.
      </p>
    </AccordionNavigatable>
  );
};
