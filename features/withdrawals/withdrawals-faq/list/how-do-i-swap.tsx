import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const HowDoISwap: React.FC = () => {
  return (
    <AccordionNavigatable
      summary="How do I swap my stETH or wstETH?"
      id="howDoISwap"
    >
      <p>
        In the Lido UI, select the DEX option powered by CowSwap, choose the
        token you want to receive, and confirm the transaction in your wallet.
        The swap will be executed without a withdrawal waiting period.
      </p>
    </AccordionNavigatable>
  );
};
