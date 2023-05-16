import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Accordion } from '@lidofinance/lido-ui';
import { getQueryParams } from 'utils';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';
import { trackMatomoEvent } from 'config/trackMatomoEvent';

export const HowCouldIUnwrapWstethToSteth: FC = () => {
  const router = useRouter();
  const { ref, embed } = router.query;
  const isUnwrapMode = router.query.mode === 'unwrap';

  const queryParamsWithoutMode = useMemo(() => {
    return getQueryParams(isUnwrapMode, ref as string, embed as string, [
      'mode',
    ]);
  }, [isUnwrapMode, ref, embed]);

  const query =
    queryParamsWithoutMode.length > 0 ? `&${queryParamsWithoutMode}` : '';
  const link = `/wrap?mode=unwrap${query}`;

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
