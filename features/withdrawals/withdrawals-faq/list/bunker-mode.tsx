import { Accordion } from '@lidofinance/lido-ui';

export const BunkerMode: React.FC = () => {
  return (
    <Accordion summary="What is Bunker mode?">
      <p>
        Bunker mode is an emergency mode that activates under three worst-case
        conditions (when penalties are large enough to significantly impact the
        protocol’s rewards).
      </p>
      <p>
        Importantly, Bunker mode allows for orderly withdrawals to still be
        processed, albeit more slowly, during chaotic tail-risk scenarios (e.g.
        mass slashings or a significant portion of NO validators going offline).
      </p>
    </Accordion>
  );
};
