import { renderToStaticMarkup } from 'react-dom/server';
import { FormProvider, useForm } from 'react-hook-form';

import { FormController } from './form-controller';
import { FormControllerContext } from './form-controller-context';
import { useFormControllerRetry } from './use-form-controller-retry-delegate';

// a server render runs no effects, so the controller's effects run at once
// to bind the retry subscription
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void) => {
      effect();
    },
  };
});

vi.mock('shared/hooks/use-wagmi-connection-changed-callback', () => ({
  useWagmiConnectionChangedCallback: () => undefined,
}));

const renderController = (disabled: boolean) => {
  const onSubmit = vi.fn(async () => false);
  let retry: ReturnType<typeof useFormControllerRetry> | undefined;

  const Probe = () => {
    const methods = useForm({ disabled });
    retry = useFormControllerRetry();
    return (
      <FormProvider {...methods}>
        <FormControllerContext.Provider
          value={{ onSubmit, retryEvent: retry.retryEvent }}
        >
          <FormController />
        </FormControllerContext.Provider>
      </FormProvider>
    );
  };
  renderToStaticMarkup(<Probe />);

  return {
    onSubmit,
    retry: retry as ReturnType<typeof useFormControllerRetry>,
  };
};

// handleSubmit validates before calling onSubmit, so let it settle
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('FormController retry', () => {
  it('declines a retry while the form is disabled', async () => {
    const { onSubmit, retry } = renderController(true);

    expect(retry.retryEvent.fire()).toBe(false);
    expect(retry.retryFire()).toBe(false);
    await flush();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts a retry and submits while the form is enabled', async () => {
    const { onSubmit, retry } = renderController(false);

    expect(retry.retryEvent.fire()).toBe(true);
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
