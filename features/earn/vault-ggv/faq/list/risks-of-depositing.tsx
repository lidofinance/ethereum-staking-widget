import { FC } from 'react';
import { Accordion } from '@lidofinance/lido-ui';

export const RisksOfDepositing: FC = () => {
  return (
    <Accordion summary="What are the risks of depositing GGV?">
      <p>
        <span>
          As with any DeFi products, there are risks. Please note this list is
          not exhaustive:
        </span>
        <ul>
          <li>Smart contract risk</li>
          <li>Liquidity provision risk - exposure to impermanent loss</li>
          <li>
            Leverage risk - the vault can use leverage, which means positions
            can be liquidated. Safeguards are in place to reduce (but not
            eliminate) this risk.
          </li>
        </ul>
        <span>
          <i>
            Always conduct your own research and consult your own professional
            advisors to understand all potential risks before participating.
          </i>
        </span>
      </p>
    </Accordion>
  );
};
