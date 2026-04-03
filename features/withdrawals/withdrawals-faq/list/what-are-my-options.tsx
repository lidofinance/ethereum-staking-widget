import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatAreMyOptions: React.FC = () => {
  return (
    <AccordionNavigatable
      summary="What are my options to exit staking?"
      id="whatAreMyOptions"
    >
      <p>Users have two ways to exit their staked position:</p>
      <ol>
        <li>
          <b>Withdraw via Lido Withdrawals</b> - unstake and receive ETH at a
          1:1 ratio after the withdrawal waiting period
        </li>
        <li>
          <b>Swap via CowSwap</b> - instantly exchange stETH or wstETH into
          other tokens directly using CowSwap through the Lido UI
        </li>
      </ol>
    </AccordionNavigatable>
  );
};
