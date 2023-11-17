import { Accordion } from '@lidofinance/lido-ui';

export const WithdrawalPeriodCircumstances: React.FC = () => {
  return (
    <Accordion
      summary="What are the factors affecting the withdrawal time?"
      id="withdrawalsPeriod"
    >
      <ul>
        <li>Demand for staking and unstaking.</li>
        <li>The amount of stETH in the queue.</li>
        <li>Protocols rules of finalization of requests.</li>
        <li>Exit queue on the Beacon chain.</li>
        <li>Performance of the validator poolside.</li>
        <li>
          The protocol mode (Turbo mode [link to &quot;What is Turbo mode&quot;]
          or Bunker mode [link to &quot;What is Bunker mode?&quot;)
        </li>
      </ul>
    </Accordion>
  );
};
