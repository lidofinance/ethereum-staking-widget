import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { getQueryParams } from 'utils';
import { MATOMO_CLICK_EVENTS_TYPES } from 'config';

export const HowDoIUnwrapWstethToSteth: FC = () => {
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
    <Accordion defaultExpanded summary="How do I unwrap wstETH back to stETH?">
      <p>
        You can unwrap your wstETH tokens using{' '}
        <Link
          href={link}
          data-matomo={
            MATOMO_CLICK_EVENTS_TYPES.faqHowDoIUnwrapWstethUnwrapLink
          }
          target="_self"
        >
          stake.lido.fi/wrap?mode=unwrap
        </Link>
        . Simply connect your wallet, specify the amount of wstETH tokens and
        press Unwrap.
      </p>
    </Accordion>
  );
};
