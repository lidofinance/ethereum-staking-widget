import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { FaqItem } from 'features/earn/shared/v2/faq';

export const RisksOfDepositing: FC = () => {
  return (
    <FaqItem
      summary="What are the risks outlined in the vault, and what's the approach for their mitigation?"
      id="earneth-risks"
    >
      <p>
        As with any DeFi application, there are inherent risks. In this case,
        the vault is exposed to risks that can generally be categorized into two
        areas: <strong>protocol-level (technical) risk</strong> and{' '}
        <strong>strategy-level (operational) risk</strong>.
      </p>

      <h4>1. Protocol-Level Risk (Smart Contract and Platform Risk)</h4>
      <p>
        These are risks arising from vulnerabilities or failures in the smart
        contracts used by the vault itself or by the third-party DeFi protocols
        it integrates with. The vault attempts to mitigate this risk by
        interacting only with protocols that have undergone extensive security
        audits, have robust practices, and have demonstrated reliability through
        long-term, large-scale usage.
      </p>

      <h4>2. Strategy-Level Risk (Operational Risk)</h4>
      <p>
        These are risks related to how the curator allocates assets in various
        DeFi strategies. Current strategies are mostly based on lending,
        recursive staking and restaking, delta neutral strategies and arbitrage.
        Each has associated risks and mitigation measures:
      </p>

      <ul>
        <li>
          <strong>Lending Risk:</strong> Lending assets in third-party protocols
          carries the risk of bad debt or insolvency events at the protocol
          level. This risk is mitigated by using lending protocols like Aave who
          have deep liquidity and deep experience in risk management along with
          insurance coverage (i.e.{' '}
          <Link target="_blank" href="https://aave.com/help/umbrella">
            Aave Umbrella
          </Link>
          ). Curators also provide continuous assessment to collaterals to
          ensure their risk rating is within acceptable limits.
        </li>
        <li>
          <strong>Leverage Risk:</strong> Leveraged staking may introduce the
          risk of losing a portion of principal due to spikes in borrow rates.
          This risk is mitigated by having a good monitoring system which allows
          for fast reaction time to unwind positions.
        </li>
        <li>
          <strong>Liquidity Provision Risk:</strong> Providing liquidity on
          decentralized exchanges (DEXs) can result in value loss due to changes
          in the relative prices of assets (impermanent loss). This risk is
          mitigated by using correlated pairs where deviations in the price
          ratio are minimal, which reduces price divergence risk.
        </li>
      </ul>

      <p>
        <em>
          Important: The risks described above are not exhaustive. Other risks
          may exist and could arise unexpectedly. While contributors to the
          protocol implement best-in-class security practices and continuously
          monitor risk exposure, no system is entirely risk-free, and some risks
          may remain despite all mitigation efforts. Anyone considering using
          the vault should conduct their own research and seek independent
          professional advice to ensure they fully understand the potential
          risks and implications before participating.{' '}
          <Link target="_blank" href="https://lido.fi/earn/risk-disclosures">
            Learn more about risks
          </Link>
          .
        </em>
      </p>
    </FaqItem>
  );
};
