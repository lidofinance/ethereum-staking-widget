import { FC } from 'react';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatAreTheRisksOutlinedInTheVault: FC = () => {
  return (
    <AccordionNavigatable
      summary="What are the risks outlined in the vault, and what’s the approach for their mitigation?"
      id="what-are-risks-outlined-in-the-vault"
    >
      <span>
        As with any DeFi application, there are inherent risks. In this case,
        the vault is exposed to risks that can generally be categorized into two
        areas: <b>protocol-level (technical) risk </b> and{' '}
        <b>strategy-level (operational) risk.</b>
      </span>
      <ul>
        <li>Protocol-Level Risk (Smart Contract and Platform Risk)</li>
        <span>
          These are risks arising from vulnerabilities or failures in the smart
          contracts used by the vault itself or by the third-party DeFi
          protocols it integrates with (e.g., Aave, Uniswap, etc.). The vault
          attempts to mitigate this risk by interacting only with protocols that
          have undergone extensive security audits, have robust practices, and
          have demonstrated reliability through long-term, large-scale usage.
        </span>
        <li>Strategy-Level Risk (Operational Risk) </li>
        <span>
          These are risks related to how the vault allocates assets in various
          DeFi strategies. Current strategies include ETH lending, leveraged
          staking, and liquidity provision in ETH–wstETH pairs. Each has
          associated risks and mitigation measures
        </span>
        <li>
          Lending Risk: Lending ETH in third-party protocols carries the risk of
          bad debt or insolvency events at the protocol level. This risk is
          mitigated by using lending protocols like Aave who have deep liquidity
          and deep experience in risk management.
        </li>
        <li>
          Leverage Risk: Leveraged staking may introduce the risk of
          liquidation. This risk is mitigated by using correlated tokens (e.g.,
          using wstETH as collateral to borrow ETH) which reduces the impact of
          market price volatility such as the risk of liquidation due to
          changes in the value of the underlying assets. Additionally, the
          specific leverage ratio is routinely monitored by the DeFi curation
          team to remain within safe thresholds.
        </li>
        <li>
          Liquidity Provision Risk: Providing liquidity on decentralized
          exchanges (DEXs) can result in value loss due to changes in the
          relative prices of assets (impermanent loss). This risk is mitigated
          by using correlated pairs like wstETH and ETH where deviations in the
          price ratio are minimal, which reduces price divergence risk.
        </li>
      </ul>
      <span>
        <i>
          Important: The risks described above are not exhaustive. Other risks
          may exist and could arise unexpectedly. While contributors to the
          protocol implement best-in-class security practices and continuously
          monitor risk exposure, no system is entirely risk-free, and some risks
          may remain despite all mitigation efforts. Anyone considering using
          the vault should conduct their own research and seek independent
          professional advice to ensure they fully understand the potential
          risks and implications before participating.
        </i>
      </span>
    </AccordionNavigatable>
  );
};
