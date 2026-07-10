import { Accordion } from '@lidofinance/lido-ui';

export const WithdrawalFee: React.FC = () => {
  return (
    <Accordion summary="Is there a fee for withdrawal or swap?">
      <p>
        There’s no withdrawal fee, but as with any Ethereum interaction, there
        will be a network gas fee. Lido does not collect a fee when you request
        a withdrawal. Swaps via CowSwap may include: market pricing differences,
        solver/execution fees, Lido fee, and Ethereum gas fees.
      </p>
    </Accordion>
  );
};
