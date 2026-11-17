import { renderToStaticMarkup } from 'react-dom/server';
import { FormProvider, useForm } from 'react-hook-form';

import { EventSubscription } from 'utils/event-subscription';

import { FormController } from './form-controller';
import { FormControllerContext } from './form-controller-context';

vi.mock('shared/hooks/use-wagmi-connection-changed-callback', () => ({
  useWagmiConnectionChangedCallback: () => undefined,
}));

type FormSubmit = (event?: React.BaseSyntheticEvent) => Promise<unknown>;

// Renders the controller and takes the submit handler it puts on the form,
// the same one the retry event is bound to
const renderSubmit = (disabled: boolean) => {
  const onSubmit = vi.fn(async () => false);
  const retryEvent = new EventSubscription();
  let submit: FormSubmit | undefined;

  const Controller = () => {
    const element = FormController({}) as React.ReactElement<{
      onSubmit: FormSubmit;
    }>;
    submit = element.props.onSubmit;
    return null;
  };
  const Probe = () => {
    const methods = useForm({ disabled });
    return (
      <FormProvider {...methods}>
        <FormControllerContext.Provider value={{ onSubmit, retryEvent }}>
          <Controller />
        </FormControllerContext.Provider>
      </FormProvider>
    );
  };
  renderToStaticMarkup(<Probe />);

  return { onSubmit, submit: submit as FormSubmit };
};

describe('FormController submit', () => {
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
