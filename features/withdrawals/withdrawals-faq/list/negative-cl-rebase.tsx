import { Accordion } from '@lidofinance/lido-ui';

export const NegativeCLRebase: React.FC = () => {
  return (
    <Accordion summary="What is a negative CL rebase?">
      <p>
        Negative CL rebase means that validators&apos; penalties are higher than
        validators&apos; rewards on Consensus Layer for a period of observation.
      </p>
    </Accordion>
  );
};
