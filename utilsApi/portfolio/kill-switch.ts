import type { ClientLimitScope } from './client-limit';

const SCOPES: ClientLimitScope[] = ['positions', 'rewards', 'history'];
const ALL = 'all';

const isScope = (value: string): value is ClientLimitScope =>
  SCOPES.some((scope) => scope === value);

export type DisabledScopes = {
  scopes: ReadonlySet<ClientLimitScope>;
  isValid: boolean;
};

// P2P_LAMBDA_DISABLED: "all" or a comma list of positions, rewards, history
export const parseDisabledScopes = (
  envValue: string | undefined,
): DisabledScopes => {
  const scopeNames = (envValue ?? '')
    .split(',')
    .map((scopeName) => scopeName.trim().toLowerCase())
    .filter(Boolean);
  const isValid = scopeNames.every(
    (scopeName) => scopeName === ALL || isScope(scopeName),
  );
  // a typo must not leave upstream calls on, so it turns everything off
  if (!isValid || scopeNames.includes(ALL)) {
    return { scopes: new Set(SCOPES), isValid };
  }
  return { scopes: new Set(scopeNames.filter(isScope)), isValid };
};
