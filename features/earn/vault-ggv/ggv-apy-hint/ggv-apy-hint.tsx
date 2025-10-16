import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { GGV_DEPOSIT_PATH } from '../../consts';

export const GGVApyHint = () => {
  return (
    <span>
      7-day average APY after{' '}
      <LinkInpageAnchor pagePath={GGV_DEPOSIT_PATH} hash={'#deposit-fee'}>
        fees
      </LinkInpageAnchor>
      <br />
      <br />
      APY is the annual percentage yield including compounding
      <br />
      <br />
      <LinkInpageAnchor
        pagePath={GGV_DEPOSIT_PATH}
        hash={'#what-is-apy-for-ggv'}
      >
        Learn more in Lido GGV FAQ
      </LinkInpageAnchor>
    </span>
  );
};
