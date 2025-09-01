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
          Always conduct your own research and consult your own professional
          advisors to understand all potential risks before participating.
        </i>
      </p>
    </AccordionNavigatable>
  );
};
