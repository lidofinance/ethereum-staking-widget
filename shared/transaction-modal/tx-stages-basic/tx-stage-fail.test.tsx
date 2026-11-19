import { renderHook } from 'features/stake/shared/__tests__/stake-test-utils';
import { TxStageFail } from './tx-stage-fail';
import type { TxRetryHandler } from '../types';

const loading = vi.hoisted(() => ({ values: [] as boolean[] }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (initial: boolean) => {
      const [value, setValue] = actual.useState(initial);
      return [
        value,
        (next: boolean) => {
          loading.values.push(next);
          setValue(next);
        },
      ];
    },
  };
});

const retryButton = (onRetry: TxRetryHandler) => {
  const content = renderHook(() => TxStageFail({ onRetry }));
  return content.props.footerHint.props.onClick as () => Promise<void>;
};

describe('failed stage Retry', () => {
  beforeEach(() => {
    loading.values = [];
  });

  it('clears loading when asynchronous form validation declines the retry', async () => {
    const click = retryButton(async () => false);
    await click();
    expect(loading.values.at(-1)).toBe(false);
  });

  it('clears loading when the attempt rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const click = retryButton(async () => {
      throw new Error('resolver failed');
    });
    await expect(click()).resolves.toBeUndefined();
    expect(loading.values.at(-1)).toBe(false);
  });

  it('starts only one attempt for repeated clicks while it is pending', async () => {
    let finish!: () => void;
    const attempt = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const click = retryButton(attempt);
    const first = click();
    const second = click();
    expect(attempt).toHaveBeenCalledTimes(1);
    finish();
    await Promise.all([first, second]);
    expect(loading.values.at(-1)).toBe(false);
  });
});
