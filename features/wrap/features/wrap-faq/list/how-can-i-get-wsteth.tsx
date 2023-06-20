import Link from 'next/link';
import { useRouter } from 'next/router';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';
import { getWrapUrl } from 'utils/getWrapUnwrapUrl';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCanIGetWsteth: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  return (
    <Accordion summary="How can I get wstETH?">
      <p>
        You can wrap your stETH or ETH tokens using{' '}
        <Link href={getWrapUrl(query)}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetWstethWrapLink,
              )
            }
            aria-hidden="true"
          >
            Wrap &amp; Unwrap staking widget
          </a>
        </Link>{' '}
        or{' '}
        <OuterLink
          href={'https://lido.fi/lido-ecosystem?tokens=wstETH&categories=Get'}
          data-matomo={MATOMO_CLICK_EVENTS_TYPES.faqHowCanIGetStEthIntegrations}
        >
          DEX Lido integrations
        </OuterLink>
      </p>
    </Accordion>
  );
};
