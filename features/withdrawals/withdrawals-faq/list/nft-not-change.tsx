import { Accordion } from '@lidofinance/lido-ui';

export const NFTNotChange: React.FC = () => {
  return (
    <Accordion summary="Why did my NFT not change the view when my request was ready to claim already?">
      <p>
        Maybe your wallet doesn’t support the automatic changing of the NFT
        view. To renew the NFT, you can import the Address and Token ID of your
        NFT, and it could change the view to a new “ready to claim” one.
      </p>
    </Accordion>
  );
};
