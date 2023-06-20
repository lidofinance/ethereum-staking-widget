import Link from 'next/link';
import { useRouter } from 'next/router';
import { Accordion } from '@lidofinance/lido-ui';
import { getUnwrapUrl } from 'utils/getWrapUnwrapUrl';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCouldIUnwrapWstethToSteth: React.FC = () => {
  const router = useRouter();
  const { query } = router;

  return (
    <Accordion summary="How could I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <Link href={getUnwrapUrl(query)}>
          <a
            onClick={() =>
              trackMatomoEvent(
                MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink,
              )
            }
            aria-hidden="true"
          >
            Wrap &amp; Unwrap staking widget
          </a>
        </Link>
        .
      </p>
    </Accordion>
  );
};
