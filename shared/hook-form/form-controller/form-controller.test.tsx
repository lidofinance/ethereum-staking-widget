import { renderToStaticMarkup } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import { EventSubscription } from 'utils/event-subscription';

import { FormController } from './form-controller';
import { FormControllerContext } from './form-controller-context';

vi.mock('shared/hooks/use-wagmi-connection-changed-callback', () => ({
  useWagmiConnectionChangedCallback: () => undefined,
}));

type FormSubmit = (event?: React.BaseSyntheticEvent) => Promise<unknown>;

// Renders the controller and takes the submit handler it puts on the form,
// the same one the retry event is bound to
const renderSubmit = (
  disabled: boolean,
  onSubmit = vi.fn(async () => false),
  onReset?: (values: Record<string, unknown>) => void,
) => {
  const retryEvent = new EventSubscription();
  let submit: FormSubmit | undefined;
  let methods!: UseFormReturn<{ amount: number; token: string }>;

  const Controller = () => {
    const element = FormController({}) as React.ReactElement<{
      onSubmit: FormSubmit;
    }>;
    submit = element.props.onSubmit;
    return null;
  };
  const Probe = () => {
    methods = useForm({ disabled, defaultValues: { amount: 1, token: 'ETH' } });
    return (
      <FormProvider {...methods}>
        <FormControllerContext.Provider
          value={{ onSubmit, onReset, retryEvent }}
        >
          <Controller />
        </FormControllerContext.Provider>
      </FormProvider>
    );
  };
  renderToStaticMarkup(<Probe />);
  // Client subscriptions activate live value reads; server rendering skips them.
  methods.subscribe({ formState: { values: true }, callback: () => undefined });

  return { onSubmit, submit: submit as FormSubmit, methods };
};

describe('FormController submit', () => {
  it.each([true, false])(
    'resets the default form only when the operation succeeds (%s)',
    async (success) => {
      const form = renderSubmit(
        false,
        vi.fn(async () => success),
      );
      form.methods.setValue('amount', 2);

      await expect(form.submit()).resolves.toBe(success);

      expect(form.methods.getValues()).toEqual({
        amount: success ? 1 : 2,
        token: 'ETH',
      });
    },
  );

  it('passes live form values to the custom reset after success', async () => {
    const onReset = vi.fn();
    const form = renderSubmit(
      false,
      vi.fn(async () => {
        form.methods.setValue('token', 'WETH');
        return true;
      }),
      onReset,
    );

    await form.submit();

    expect(onReset).toHaveBeenCalledWith({ amount: 1, token: 'WETH' });
  });

  it('sends nothing while the form is disabled', async () => {
    const { onSubmit, submit } = renderSubmit(true);
    const preventDefault = vi.fn();

    await submit({ preventDefault } as unknown as React.BaseSyntheticEvent);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('sends while the form is enabled', async () => {
    const { onSubmit, submit } = renderSubmit(false);

    await submit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
