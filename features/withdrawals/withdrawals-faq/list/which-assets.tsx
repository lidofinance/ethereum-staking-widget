import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

export const WhichAssets: React.FC = () => {
  return (
    <AccordionNavigatable
      summary="Which assets can I receive when using swap?"
      id="whichAssets"
    >
      <p>
        When using CowSwap, you can swap your stETH or wstETH into: ETH, WETH,
        USDC, USDT, USDS and WBTC.
      </p>
    </AccordionNavigatable>
  );
};
