import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const HowDoIClaimRewards: FC = () => {
  return (
    <Accordion summary="How do I claim my rewards?">
      <p>
        You need to claim SSV and Obol rewards via the Claim button in the Lido
        DVV UI, which will lead you to SSV and Obol UIs or directly on{' '}
        <Link href="https://www.ssvrewards.com">SSV UI</Link> or{' '}
        <Link href="https://obol.org/incentives">Obol UI</Link>. Mellow rewards
        accumulated automatically and will be claimable in the future.
      </p>
    </Accordion>
  );
};
