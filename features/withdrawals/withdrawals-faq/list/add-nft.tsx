import { Accordion, Link } from '@lidofinance/lido-ui';
import { LINK_ADD_NFT_GUIDE } from 'consts/external-links';
import { MATOMO_CLICK_EVENTS_TYPES } from 'consts/matomo-click-events';

export const HowToAddNFT = () => {
  return (
    <Accordion summary="How do I add the Lido NFT to my wallet?">
      <p>
        Different wallets have specific functionality for adding and working
        with NFT. Most often, you need to find the specific NFT Address and
        Token ID. These parameters you can find on Etherscan. Visit Etherscan,
        add your wallet, and locate the NFT transaction. Once located, open the
        NFT transaction, and you will see the Address and Token ID.
      </p>
      <p>
        If you are a MetaMask user, use{' '}
        <Link
          href={LINK_ADD_NFT_GUIDE}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.withdrawalNFTGuideFAQ}
        >
          this guide
        </Link>
        .
      </p>
    </Accordion>
  );
};
