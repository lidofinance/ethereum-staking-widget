import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { ETH_DEPOSIT_PATH } from 'features/earn/consts';
import { FAQ_IDS } from './faq/faq';

export const ProtectedTooltip = () => {
  return (
    <>
      Two layers of loss protection: Firelight provides protection for up to 5%
      of the vault&apos;s total value, followed by Lido DAO-funded loss
      protection. Eligibility conditions and limits apply.{' '}
      <LinkInpageAnchor
        pagePath={ETH_DEPOSIT_PATH}
        hash={`#${FAQ_IDS.lossProtection}`}
      >
        Learn more
      </LinkInpageAnchor>
    </>
  );
};
