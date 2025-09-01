import { FC } from 'react';
import { Accordion, Link } from '@lidofinance/lido-ui';

export const WhoIsCurator: FC = () => {
  const STEAKHOUSE_URL = 'https://www.steakhouse.financial/';
  return (
    <Accordion summary="Who is the curator for DVV, and what’s their role?">
      <p>
        The curator for DVV is{' '}
        <Link href={STEAKHOUSE_URL}> Steakhouse Financial</Link>, their role is
        overseeing strategy execution and managing the vault&apos;s operational
        flow.
      </p>
    </Accordion>
  );
};
