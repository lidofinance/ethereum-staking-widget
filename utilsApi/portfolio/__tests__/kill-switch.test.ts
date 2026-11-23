import { parseDisabledScopes } from '../kill-switch';

const ALL = ['positions', 'rewards', 'history'];

describe('parseDisabledScopes', () => {
  it.each([undefined, '', '  ', ','])('leaves all on for %j', (value) => {
    const { scopes, isValid } = parseDisabledScopes(value);
    expect([...scopes]).toEqual([]);
    expect(isValid).toBe(true);
  });

  it('turns off the listed scopes only', () => {
    const { scopes, isValid } = parseDisabledScopes(' History, rewards ');
    expect([...scopes].sort()).toEqual(['history', 'rewards']);
    expect(isValid).toBe(true);
  });

  it.each(['all', 'ALL', 'history,all'])('turns all off for %j', (value) => {
    const { scopes, isValid } = parseDisabledScopes(value);
    expect([...scopes].sort()).toEqual([...ALL].sort());
    expect(isValid).toBe(true);
  });

  it.each(['true', 'histroy', 'history;rewards'])(
    'turns all off on a typo: %j',
    (value) => {
      const { scopes, isValid } = parseDisabledScopes(value);
      expect([...scopes].sort()).toEqual([...ALL].sort());
      expect(isValid).toBe(false);
    },
  );
});
