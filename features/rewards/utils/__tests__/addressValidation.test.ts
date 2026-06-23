import { isValidEns, isValidAnyAddress } from '../addressValidation';

describe('isValidEns', () => {
  describe('valid ENS names', () => {
    test.each([
      'lido.eth',
      'lido-staking.eth',
      'name123.eth',
      'sub.lido.eth',
      '0xabc.eth',
    ])('accepts %s', (name) => {
      expect(isValidEns(name)).toBe(true);
    });
  });

  describe('invalid ENS names', () => {
    test.each([
      ['lido.feth1', 'no .eth suffix'],
      ['lido.feth1.com', 'wrong TLD'],
      ['notanens', 'no TLD at all'],
      ['', 'empty string'],
      ['.eth', 'empty label'],
      ['name@domain.eth', '@ not allowed'],
      ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'plain Ethereum address'],
    ])('rejects %s (%s)', (name) => {
      expect(isValidEns(name)).toBe(false);
    });
  });
});

describe('isValidAnyAddress', () => {
  test('accepts a valid Ethereum address', () => {
    expect(
      isValidAnyAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
    ).toBe(true);
  });

  test('accepts a valid ENS name', () => {
    expect(isValidAnyAddress('lido.eth')).toBe(true);
  });

  test('rejects an arbitrary string', () => {
    expect(isValidAnyAddress('notanaddress')).toBe(false);
  });
});
