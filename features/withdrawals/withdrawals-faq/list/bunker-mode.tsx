import { Accordion } from '@lidofinance/lido-ui';
import { useScrollToId } from '../utils/useScrollToId';

export const BunkerMode: React.FC = () => {
  const { id, opened } = useScrollToId('whatIsBunkerMode');
  return (
    <Accordion id={id} defaultExpanded={opened} summary="What is Bunker mode?">
      <p>
        Bunker mode is an emergency mode that activates under three worst-case
        conditions (when penalties are large enough to significantly impact the
        protocol’s rewards).
      </p>
      <p>
        Importantly, Bunker mode allows for orderly withdrawals to be still
        processed, albeit more slowly, during chaotic tail-risk scenarios (e.g.
        mass slashings or a significant portion of validators going offline).
      </p>
    </Accordion>
  );
};
