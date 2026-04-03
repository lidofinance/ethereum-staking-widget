import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhatIsTheDifference: React.FC = () => {
  return (
    <AccordionNavigatable
      summary="What is the difference between withdrawal and swap?"
      id="whatIsTheDifference"
    >
      <p>
        <b>Withdrawal via Lido:</b>
      </p>
      <ol>
        <li>ETH at a fixed 1:1 rate</li>
        <li>Requires waiting time (typically 1–5 days)</li>
        <li>No price impact</li>
        <li>Subject to queue and protocol conditions</li>
      </ol>
      <p>
        <b>Swap via CowSwap:</b>
      </p>
      <ol>
        <li>Instant execution</li>
        <li>No waiting period</li>
        <li>Market-based rate (may differ from 1:1)</li>
        <li>Access to multiple assets</li>
      </ol>
    </AccordionNavigatable>
  );
};
