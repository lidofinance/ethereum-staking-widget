import { Accordion } from '@lidofinance/lido-ui';

export const LidoNFT: React.FC = () => {
  return (
    <Accordion summary="What is Lido NFT?">
      <p>
        Each withdrawal request is represented by an NFT: the NFT is
        automatically minted for you when you send a request. You will need to
        add it to your wallet to be able to monitor the request status. When the
        request is ready for the claim, the NFT will change the view.
      </p>
    </Accordion>
  );
};
