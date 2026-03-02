import { FC } from 'react';
import { AccordionTransparent } from '@lidofinance/lido-ui';

export const RisksOfDepositing: FC = () => {
  return (
    <AccordionTransparent
      summary="What are the risks outlined in the vault, and what's the approach for their mitigation?"
      id="earnusd-risks"
    >
      <p>
        As with any DeFi application, there are inherent risks. In this case,
        the vault is exposed to risks that can generally be categorized into
        three areas: <strong>protocol-level (technical) risk</strong>,{' '}
        <strong>strategy-level (operational) risk</strong> and{' '}
        <strong>third-party (market) risk</strong>.
      </p>

      <h4>1. Protocol-Level Risk (Smart Contract and Platform Risk)</h4>
      <p>
        These are risks arising from vulnerabilities or failures in the smart
        contracts used by the vault itself or by the third-party DeFi protocols
        it integrates with. This risk is mitigated by only whitelisting within
        the vault infrastructure protocols that have undergone security audits,
        have robust practices, and have demonstrated reliability through
        long-term, large-scale usage.
      </p>

      <h4>2. Strategy-Level Risk (Operational Risk)</h4>
      <p>
        These are risks related to how the curator allocates assets in various
        DeFi strategies. Current strategies include lending, rehypothecation,
        delta-neutral strategies and arbitrage. Each has associated risks and
        mitigation measures:
      </p>
      <ul>
        <li>
          <strong>Lending Risk:</strong> Lending USDC/USDT in third-party
          protocols carries the risk of bad debt or insolvency events at the
          protocol level. This risk is mitigated by using lending protocols like
          Aave who have deep liquidity and deep experience in risk management.
          Curators also provide continuous assessment to collaterals to ensure
          their risk rating is within acceptable limits.
        </li>
        <li>
          <strong>Leverage Risk:</strong> Leveraged staking may introduce the
          risk of liquidation. This risk is mitigated by using correlated tokens
          (e.g., using sUSDe as collateral to borrow USDe) which reduces the
          impact of market price volatility such as the risk of liquidation due
          to changes in the value of the underlying assets. Additionally, the
          specific leverage ratio is routinely monitored by the curation team to
          remain within agreed thresholds.
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
          <a href="https://lido.fi/earn/risk-disclosures">
            Learn more about risks.
          </a>
        </em>
      </p>
    </AccordionTransparent>
  );
};
