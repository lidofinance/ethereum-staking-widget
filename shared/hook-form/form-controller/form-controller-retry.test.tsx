import { renderToStaticMarkup } from 'react-dom/server';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import { FormController } from './form-controller';
import { FormControllerContext } from './form-controller-context';
import { useFormControllerRetry } from './use-form-controller-retry-delegate';

// a server render runs no effects, so the controller's effects run at once
// to bind the retry subscription
const lifecycle = vi.hoisted(() => ({
  cleanups: [] as (() => void)[],
  refs: [] as { current: unknown }[],
  replayRefs: false,
  cursor: 0,
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useEffect: (effect: () => void | (() => void)) => {
      const cleanup = effect();
      if (cleanup) lifecycle.cleanups.push(cleanup);
    },
    useRef: (initial: unknown) => {
      const ref = actual.useRef(initial);
      if (lifecycle.replayRefs) return lifecycle.refs[lifecycle.cursor++];
      lifecycle.refs.push(ref);
      return ref;
    },
  };
});

vi.mock('shared/hooks/use-wagmi-connection-changed-callback', () => ({
  useWagmiConnectionChangedCallback: () => undefined,
}));

const renderController = (
  disabled: boolean,
  valid = true,
  onSubmit = vi.fn(async () => true),
  resolver?: Resolver,
) => {
  let retry: ReturnType<typeof useFormControllerRetry> | undefined;

  const Probe = () => {
    const methods = useForm({
      disabled,
      resolver:
        resolver ??
        (async () =>
          valid
            ? { values: {}, errors: {} }
            : {
                values: {},
                errors: {
                  amount: { type: 'validate', message: 'Invalid amount' },
                },
              }),
    });
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
    unmount: () => lifecycle.cleanups.forEach((cleanup) => cleanup()),
    disable: () => {
      disabled = true;
      lifecycle.replayRefs = true;
      lifecycle.cursor = 0;
      try {
        renderToStaticMarkup(<Probe />);
      } finally {
        lifecycle.replayRefs = false;
      }
    },
  };
};

// handleSubmit validates before calling onSubmit, so let it settle
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('FormController retry', () => {
  beforeEach(() => {
    lifecycle.cleanups = [];
    lifecycle.refs = [];
    lifecycle.replayRefs = false;
  });

  it.each(['unmount', 'disable'] as const)(
    'does not submit if the form is %s while validation is pending',
    async (stop) => {
      let finish!: () => void;
      const resolver: Resolver = () =>
        new Promise((resolve) => {
          finish = () => resolve({ values: {}, errors: {} });
        });
      const onSubmit = vi.fn(async () => true);
      const form = renderController(false, true, onSubmit, resolver);
      const pending = form.retry.retryFire();
      await flush();
      form[stop]();
      finish();
      await expect(pending).resolves.toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('declines a retry while the form is disabled', async () => {
    const { onSubmit, retry } = renderController(true);

    await expect(retry.retryEvent.fire()).resolves.toBe(false);
    await expect(retry.retryFire()).resolves.toBe(false);
    await flush();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('accepts a retry and submits while the form is enabled', async () => {
    const { onSubmit, retry } = renderController(false);

    await expect(retry.retryEvent.fire()).resolves.toBe(true);
    await flush();

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('declines after form validation rejects the amount', async () => {
    const { onSubmit, retry } = renderController(false, false);
    await expect(retry.retryFire()).resolves.toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('waits for the attempt to finish and returns its outcome', async () => {
    let finish!: (value: boolean) => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    const { retry } = renderController(false, true, onSubmit);
    let settled = false;
    const pending = Promise.resolve(retry.retryFire()).then((result) => {
      settled = true;
      return result;
    });
    await flush();
    expect(settled).toBe(false);
    finish(false);
    await expect(pending).resolves.toBe(false);
  });
});
