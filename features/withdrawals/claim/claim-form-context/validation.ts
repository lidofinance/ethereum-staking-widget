import { Resolver } from 'react-hook-form';
import {
  ValidationError,
  handleResolverValidationError,
} from 'shared/hook-form/validation/validation-error';
import invariant from 'tiny-invariant';
import { ClaimFormValidationContext, ClaimFormInputType } from './types';
import { RequestStatusClaimable } from 'features/withdrawals/types/request-status';

export const claimFormValidationResolver: Resolver<
  ClaimFormInputType,
  ClaimFormValidationContext
> = async ({ requests }, context) => {
  invariant(context);
  try {
    const { maxSelectedRequestCount, active } = context;
    const selectedTokens = requests
      .filter((r) => r.checked)
      .map((r) => r.status as RequestStatusClaimable);

    if (selectedTokens.length === 0)
      throw new ValidationError('requests', 'No requests selected for claim');

    if (selectedTokens.length > maxSelectedRequestCount)
      throw new ValidationError(
        'requests',
        `Cannot claim more than ${maxSelectedRequestCount} requests at once`,
      );

    if (!active) {
      return {
        values: {
          requests,
          selectedTokens,
        },
        errors: { selectedTokens: 'no wallet connected' },
      };
    }

    return {
      values: {
        requests,
        selectedTokens,
      },
      errors: {},
    };
  } catch (error) {
    return handleResolverValidationError(error, 'ClaimForm', 'selectedTokens');
  }
};
