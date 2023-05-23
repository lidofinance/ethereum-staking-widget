import { maxNumberValidation } from '../maxNumberValidation';

describe('maxNumberValidation', () => {
  it('should return "0" if input is not a number', () => {
    expect(maxNumberValidation('not a number')).toBe('0');
  });

  it('should return maximum safe integer if input is infinite', () => {
    expect(maxNumberValidation('Infinity')).toBe('9007199254740991');
  });

  it('should return the input if it is a valid number', () => {
    expect(maxNumberValidation('123')).toBe('123');
  });

  it('should return the maximum safe integer if input is greater than the maximum safe integer', () => {
    expect(maxNumberValidation('9007199254740992')).toBe('9007199254740991');
  });
});
