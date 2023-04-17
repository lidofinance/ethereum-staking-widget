import { Accordion } from '@lidofinance/lido-ui';

export const WithdrawalPeriodCircumstances: React.FC = () => {
  return (
    <Accordion
      summary="What does the withdrawal period duration depend on?"
      id="withdrawalsPeriod"
    >
      <ol>
        <li>The amount of stETH in the queue.</li>
        <li>Perfomance on the validator poolside.</li>
        <li>Exit queue on the Beacon chain.</li>
        <li>Demand for staking and unstaking.</li>
      </ol>
    </Accordion>
  );
};
