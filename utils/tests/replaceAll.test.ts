import { replaceAll } from 'utils/replaceAll';

describe('replaceAll', () => {
  test('should replace correctly', () => {
    const str = 'hello REPLACE_THIS';
    const replaceMap = {
      REPLACE_THIS: 'world',
    };

    const result = replaceAll(str, replaceMap);

    expect(result).toBe('hello world');
  });
});
