import { FC, useCallback } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { useAddNFT } from 'features/withdrawals/hooks';

export const LidoNFT: FC = () => {
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
        Each withdrawal request is NFT, and NFT is automatically minted for the
        user when sending the request. You need to add it to your wallet to
        monitor the request status. When the request is ready for the claim, the
        NFT will change.{' '}
        {addNft && (
          <>
            If you didn&amp;t add your NFT after requesting withdrawal, you
            could{' '}
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
