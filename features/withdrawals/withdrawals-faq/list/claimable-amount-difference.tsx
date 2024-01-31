import { AccordionNavigatable } from 'shared/components/accordion-navigatable';

type ClaimableAmountDifferenceProps = {
  title: string;
};

export const ClaimableAmountDifference: React.FC<
  ClaimableAmountDifferenceProps
> = ({ title }) => {
  return (
    <AccordionNavigatable summary={title} id="amountDifferentFromRequested">
      <p>
        The amount you can claim may differ from your initial request due to a
        slashing occurrence and penalties. For these reasons, the total
        claimable reward amount could be reduced.
      </p>
    </AccordionNavigatable>
  );
};
