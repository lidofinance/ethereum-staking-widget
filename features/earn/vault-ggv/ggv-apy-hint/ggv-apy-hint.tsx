import { LinkInpageAnchor } from 'shared/components/link-inpage-anchor';
import { EARN_VAULT_DEPOSIT_SLUG, EARN_VAULT_GGV_SLUG } from '../../consts';
import { EARN_PATH } from 'consts/urls';

export const GGVApyHint = () => {
  const GGV_DEPOSIT_PATH = `${EARN_PATH}/${EARN_VAULT_GGV_SLUG}/${EARN_VAULT_DEPOSIT_SLUG}`;

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
      At GGV launch, and for the first 14 days, the daily APY will be displayed
      instead of the 7-day APY due to insufficient historical data.
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
