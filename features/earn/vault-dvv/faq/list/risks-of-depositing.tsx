import { FC } from 'react';
import { Link } from '@lidofinance/lido-ui';
import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const RisksOfDepositing: FC = () => {
  return (
    <AccordionNavigatable
      summary="What are the risks of depositing DVV?"
      id="risks-of-depositing"
    >
      <p>
        As with any DeFi products, there are risks. Please note this list is not
        exhaustive:
      </p>
      <ul>
        <li>Smart contract risk</li>
        <li>Validator slashing risk</li>
        <li>
          <Link href="https://help.lido.fi/en/articles/5230603-what-are-the-risks-of-staking-with-lido">
            Other inherited Lido protocol risks
          </Link>
        </li>
      </ul>
      <p>
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
      </p>
    </AccordionNavigatable>
  );
};
