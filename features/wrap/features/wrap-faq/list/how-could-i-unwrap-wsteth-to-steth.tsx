import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Accordion } from '@lidofinance/lido-ui';
import { getQueryParamsString } from 'utils';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCouldIUnwrapWstethToSteth: FC = () => {
  const { query } = useRouter();
  const { ref, embed } = query;
  const link = useMemo(() => {
    return `/wrap/unwrap${getQueryParamsString(ref, embed)}`;
  }, [ref, embed]);

  return (
    <Accordion summary="How could I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <Link href={link}>
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
