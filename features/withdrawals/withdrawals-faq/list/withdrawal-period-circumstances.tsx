import { AccordionNavigatable } from 'shared/components/accordion-navigatable';
import { WHAT_IS_BUNKER, WHAT_IS_TURBO } from '../../withdrawals-constants';
import Link from 'next/link';

export const WithdrawalPeriodCircumstances: React.FC = () => {
  return (
    <AccordionNavigatable
      summary="What are the factors affecting the withdrawal time?"
      id="withdrawalsPeriod"
    >
      <ul>
        <li>Demand for staking and unstaking.</li>
        <li>The amount of stETH in the queue.</li>
        <li>Protocols rules of finalization of requests.</li>
        <li>Exit queue on the Beacon chain.</li>
        <li>Performance of the validator poolside.</li>
        <li>
          The protocol mode (<Link href={WHAT_IS_TURBO}>Turbo&nbsp;mode</Link>{' '}
          or <Link href={WHAT_IS_BUNKER}>Bunker&nbsp;mode</Link>)
        </li>
      </ul>
    </AccordionNavigatable>
  );
};
