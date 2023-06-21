import { FC, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Accordion, Link as OuterLink } from '@lidofinance/lido-ui';
import { getQueryParamsString } from 'utils';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCanIGetWsteth: FC = () => {
  const { query } = useRouter();
  const { ref, embed } = query;
  const link = useMemo(() => {
    return `/wrap${getQueryParamsString(ref, embed)}`;
  }, [ref, embed]);

  return (
    <Accordion summary="How can I get wstETH?">
      <p>
        You can wrap your stETH or ETH tokens using{' '}
        <Link href={link}>
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
