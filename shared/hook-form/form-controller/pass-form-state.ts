const FORM_STATE_STORAGE = new Map<string, Record<string, any>>();

// Define the possible form scopes for type safety.
type FormScopes = 'stake';

export const passFormState = (
  formScope: FormScopes,
  formState: Record<string, any>,
) => {
  FORM_STATE_STORAGE.set(formScope, formState);
};

export const recoverFormState = (
  formScope: FormScopes,
): Record<string, any> => {
  return FORM_STATE_STORAGE.get(formScope) ?? {};
};
