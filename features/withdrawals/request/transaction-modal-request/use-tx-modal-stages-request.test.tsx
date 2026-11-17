import { TxStaleError } from 'modules/web3/utils/errors';

const transitStage = vi.hoisted(() => vi.fn());

vi.mock('shared/transaction-modal/hooks/use-transaction-modal-stage', () => ({
  useTransactionModalStage: (
    getStages: (transit: typeof transitStage) => unknown,
  ) => ({ txModalStages: getStages(transitStage) }),
}));

import { useTxModalStagesRequest } from './use-tx-modal-stages-request';

describe('request modal failed stage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('shows nothing for a superseded flow', () => {
    const { txModalStages } = useTxModalStagesRequest();

    txModalStages.failed(new TxStaleError());

    expect(transitStage).not.toHaveBeenCalled();
  });

  it('shows the failure for another error', () => {
    const { txModalStages } = useTxModalStagesRequest();

    txModalStages.failed(new Error('boom'));

    expect(transitStage).toHaveBeenCalledTimes(1);
  });
});
