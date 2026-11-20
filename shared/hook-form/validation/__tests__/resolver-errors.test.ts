import { createFormControl } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import {
  DefaultValidationErrorTypes,
  ValidationError,
  handleResolverValidationError,
  isValidationErrorTypeUnhandled,
  isValidationErrorTypeValidate,
  walletNotConnectedResult,
} from '../validation-error';

type Values = { amount: string; token: string };

// the app's resolvers all return the result of these helpers or throw
// ValidationError which is converted by handleResolverValidationError
const makeForm = (resolver: Resolver<Values>, criteriaMode?: 'all') =>
  createFormControl<Values>({
    defaultValues: { amount: '1', token: 'ETH' },
    resolver,
    mode: 'onChange',
    criteriaMode,
  });

describe('resolver errors through react-hook-form', () => {
  it('passes ValidationError field, message, type and payload through', async () => {
    const { control, formControl } = makeForm(async () => {
      try {
        throw new ValidationError('amount', 'too much', undefined, {
          max: 1n,
        });
      } catch (error) {
        return handleResolverValidationError(error, 'Test', 'token');
      }
    });
    const valid = await formControl.trigger();
    expect(valid).toBe(false);
    const err = control._formState.errors.amount;
    expect(err?.message).toBe('too much');
    expect(err?.type).toBe(DefaultValidationErrorTypes.VALIDATE);
    expect((err as { payload?: unknown }).payload).toEqual({ max: 1n });
    expect(isValidationErrorTypeValidate(err?.type)).toBe(true);
    expect(control._formState.errors.token).toBeUndefined();
  });

  it('keeps a custom ValidationError type', async () => {
    const { control, formControl } = makeForm(async () =>
      handleResolverValidationError(
        new ValidationError('amount', 'split', 'SPLIT_REQUEST'),
        'Test',
        'token',
      ),
    );
    await formControl.trigger();
    expect(control._formState.errors.amount?.type).toBe('SPLIT_REQUEST');
  });

  it('reports unknown errors on the fallback field as UNHANDLED', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { control, formControl } = makeForm(async () =>
      handleResolverValidationError(new Error('boom'), 'Test', 'token'),
    );
    expect(await formControl.trigger()).toBe(false);
    const err = control._formState.errors.token;
    expect(err?.type).toBe(DefaultValidationErrorTypes.UNHANDLED);
    expect(err?.message).toBe('unknown validation error');
    expect(isValidationErrorTypeUnhandled(err?.type)).toBe(true);
    expect(control._formState.errors.amount).toBeUndefined();
    warn.mockRestore();
  });

  it('wallet-not-connected blocks validity without looking like a VALIDATE error', async () => {
    const { control, formControl } = makeForm(async () =>
      walletNotConnectedResult('token'),
    );
    expect(await formControl.trigger()).toBe(false);
    const err = control._formState.errors.token;
    expect(err?.type).toBe(DefaultValidationErrorTypes.WALLET_NOT_CONNECTED);
    expect(err?.message).toBeUndefined();
    expect(isValidationErrorTypeValidate(err?.type)).toBe(false);
    expect(isValidationErrorTypeUnhandled(err?.type)).toBe(false);
  });

  it('clears errors once the resolver succeeds', async () => {
    let fail = true;
    const { control, formControl } = makeForm(async (values) =>
      fail
        ? handleResolverValidationError(
            new ValidationError('amount', 'bad'),
            'Test',
            'token',
          )
        : { values, errors: {} },
    );
    await formControl.trigger();
    expect(control._formState.errors.amount).toBeDefined();
    fail = false;
    expect(await formControl.trigger()).toBe(true);
    expect(control._formState.errors.amount).toBeUndefined();
  });

  it('behaves the same with criteriaMode all', async () => {
    const { control, formControl } = makeForm(
      async () =>
        handleResolverValidationError(
          new ValidationError('amount', 'bad'),
          'Test',
          'token',
        ),
      'all',
    );
    await formControl.trigger();
    const err = control._formState.errors.amount;
    expect(err?.message).toBe('bad');
    expect(err?.type).toBe(DefaultValidationErrorTypes.VALIDATE);
  });
});
