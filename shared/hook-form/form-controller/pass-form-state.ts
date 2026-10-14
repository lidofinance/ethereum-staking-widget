const FORM_STATE_STORAGE = new Map<string, Record<string, any>>();

// Define the possible form scopes for type safety.
type FormScopes = 'stake' | 'stakeL2';

export const passFormStateTo = (
  formScopeTo: FormScopes,
  formState: Record<string, any>,
) => {
  FORM_STATE_STORAGE.set(formScopeTo, formState);
};

export const recoverFormState = (
  formScope: FormScopes,
): Record<string, any> => {
  return FORM_STATE_STORAGE.get(formScope) ?? {};
};

export const clearFormState = (formScope: FormScopes[]) => {
  formScope.forEach((scope) => FORM_STATE_STORAGE.delete(scope));
};
