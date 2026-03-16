import { Token, TokenSymbol } from 'consts/tokens';

// Converts a case sensitive TokenSymbol to a Token which must be lowercase.
// Usage example: form values use TokenSymbol which can be uppercase,
// but some functions expects Token which is lowercase.
export const asToken = <T extends string = Token>(
  token: Token | TokenSymbol,
) => {
  return token.toLowerCase() as T;
};
