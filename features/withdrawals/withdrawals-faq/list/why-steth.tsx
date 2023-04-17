import { Accordion } from '@lidofinance/lido-ui';

export const WhySTETH: React.FC = () => {
  return (
    <Accordion summary="When I try to withdraw wstETH, why do I see the stETH amount in my request?">
      <p>
        When you request to withdraw wstETH, it is automatically unwrapped into
        stETH, which then gets transformed into ETH (this is the step that takes
        time). The main withdrawal period is when stETH is transformed to ETH.
        That&apos;s why you see the amount pending denominated in stETH.
      </p>
    </Accordion>
  );
};
