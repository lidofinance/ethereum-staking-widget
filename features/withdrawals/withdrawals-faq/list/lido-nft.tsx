import { useCallback } from 'react';
import { useAddNFT } from 'features/withdrawals/hooks';

import { Accordion, Link } from '@lidofinance/lido-ui';

export const LidoNFT: React.FC = () => {
  const { addNft } = useAddNFT();
  const handleClickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      addNft?.();
    },
    [addNft],
  );
  return (
    <Accordion summary="What is Lido NFT?">
      <p>
        Each withdrawal request is represented by an NFT: the NFT is
        automatically minted for you when you send a request. You will need to
        add it to your wallet to be able to monitor the request status. When the
        request is ready for the claim, the NFT will change the view.{' '}
        {addNft && (
          <>
            If you didn&apos;t add your NFT when you requested withdrawal, you
            can{' '}
            <Link href="" onClick={handleClickAdd}>
              do it now
            </Link>
            .
          </>
        )}
      </p>
    </Accordion>
  );
};
