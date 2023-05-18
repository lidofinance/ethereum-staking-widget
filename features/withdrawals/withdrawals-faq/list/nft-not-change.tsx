import { Accordion } from '@lidofinance/lido-ui';

export const NFTNotChange: React.FC = () => {
  return (
    <Accordion summary="What could be the reason why my NFT's view did not update even though my request was ready to be claimed?">
      <p>
        Maybe your wallet doesn’t support the automatic changing of the NFT
        view. To renew the NFT, you can import the Address and Token ID of your
        NFT, and it could change it&apos;s appearance to a new “ready to claim”
        one.
      </p>
    </Accordion>
  );
};
