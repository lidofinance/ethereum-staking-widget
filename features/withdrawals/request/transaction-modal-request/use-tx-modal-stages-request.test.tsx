import {
  TxFlowInterruptedError,
  TxStaleError,
} from 'modules/web3/utils/errors';

const transitStage = vi.hoisted(() => vi.fn());

vi.mock('shared/transaction-modal/hooks/use-transaction-modal-stage', () => ({
  useTransactionModalStage: (
    getStages: (transit: typeof transitStage) => unknown,
  ) => ({ txModalStages: getStages(transitStage) }),
}));

vi.mock('utils/track-matomo-event', () => ({ trackMatomoEvent: vi.fn() }));

import { ErrorMessage } from 'utils/getErrorMessage';
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

  it('offers to continue an interrupted request with the given retry handler', () => {
    const { txModalStages } = useTxModalStagesRequest();
    const onRetry = vi.fn(() => false);

    txModalStages.failed(
      new TxFlowInterruptedError(
        ErrorMessage.WITHDRAWAL_REQUEST_INTERRUPTED,
        new Error('boom'),
      ),
      onRetry,
    );

    expect(transitStage).toHaveBeenCalledTimes(1);
    const [stage] = transitStage.mock.calls[0];
    expect(stage.props.failedText).toBe(
      ErrorMessage.WITHDRAWAL_REQUEST_INTERRUPTED,
    );
    // passed as is, so a declined retry keeps its return value
    expect(stage.props.onRetry).toBe(onRetry);
  });
});

describe('Bunker confirmation', () => {
  const close = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    transitStage.mockImplementation((_stage, props) => props.onOpen?.(close));
  });

  it('cancels when the outer modal is dismissed', async () => {
    const { txModalStages } = useTxModalStagesRequest();
    const result = txModalStages.dialogBunker();
    const [, props] = transitStage.mock.calls[0];
    props.onDismiss?.();
    await expect(result).resolves.toBe(false);
  });

  it('closes its own session when Cancel is clicked', async () => {
    const { txModalStages } = useTxModalStagesRequest();
    const result = txModalStages.dialogBunker();
    const [stage] = transitStage.mock.calls[0];
    stage.props.onClose();
    await expect(result).resolves.toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('continues when confirmed and ignores a later dismissal', async () => {
    const { txModalStages } = useTxModalStagesRequest();
    const result = txModalStages.dialogBunker();
    const [stage, props] = transitStage.mock.calls[0];
    stage.props.onClick();
    props.onDismiss?.();
    await expect(result).resolves.toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('cancels immediately if its stage can no longer be shown', async () => {
    transitStage.mockImplementationOnce(() => undefined);
    const { txModalStages } = useTxModalStagesRequest();
    await expect(txModalStages.dialogBunker()).resolves.toBe(false);
  });
});
