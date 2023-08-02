import { Accordion } from '@lidofinance/lido-ui';

export const WithdrawalPeriodCircumstances: React.FC = () => {
  return (
    <Accordion
      summary="What are the factors affecting the withdrawal time?"
      id="withdrawalsPeriod"
    >
      <ul>
        <li>The amount of stETH in the queue.</li>
        <li>Perfomance of the validator poolside.</li>
        <li>Exit queue on the Beacon chain.</li>
        <li>Demand for staking and unstaking.</li>
      </ul>
    </Accordion>
  );
};
