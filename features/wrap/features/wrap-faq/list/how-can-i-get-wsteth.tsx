import { FC, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Accordion, Link } from '@lidofinance/lido-ui';
import { getQueryParams } from 'utils';

const TITLE = 'How can I get wstETH?';

export const HowCanIGetWsteth: FC = () => {
  const router = useRouter();
  const { ref, embed } = router.query;
  const isUnwrapMode = router.query.mode === 'unwrap';

  const queryParamsWithoutMode = useMemo(() => {
    return getQueryParams(isUnwrapMode, ref as string, embed as string, [
      'mode',
    ]);
  }, [isUnwrapMode, ref, embed]);

  const query =
    queryParamsWithoutMode.length > 0 ? `?${queryParamsWithoutMode}` : '';
  const link = `/wrap${query}`;

  return (
    <Accordion defaultExpanded summary={TITLE}>
      <p>
        You can wrap your stETH tokens using{' '}
        <Link href={link} target="_self">
          stake.lido.fi/wrap
        </Link>
        . Simply connect your wallet, unlock your stETH tokens and press Wrap.
      </p>
      <p>
        You can also choose to convert your ETH to wstETH directly. To do this,
        select ETH on the token drop down. This allows you to save on gas when
        compared to swapping from ETH to stETH to wstETH.
      </p>
    </Accordion>
  );
};
