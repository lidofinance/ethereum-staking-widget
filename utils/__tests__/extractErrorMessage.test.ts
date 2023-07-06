import { extractErrorMessage } from '../extractErrorMessage';

describe('extractErrorMessage', () => {
  it('should return the error message if the error is a string', () => {
    const error = 'Something went wrong';
    expect(extractErrorMessage(error)).toEqual(error);
  });

  it('should return the error message if the error is an instance of Error', () => {
    const error = new Error('Something went wrong');
    expect(extractErrorMessage(error)).toEqual(error.message);
  });

  it('should return the error message if the error is an object with a message property', () => {
    const error = { message: 'Something went wrong' };
    expect(extractErrorMessage(error)).toEqual(error.message);
  });

  it('should return a default error message if the error is not a string, an instance of Error, or an object with a message property', () => {
    const error = null;
    expect(extractErrorMessage(error)).toEqual('Something went wrong');
  });
});
