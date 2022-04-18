export enum ErrorMessage {
  NOT_ENOUGH_ETHER = 'Not enough ether for gas.',
  DENIED_SIG = 'User denied transaction signature.',
  SOMETHING_WRONG = 'Something went wrong.',
}

export const getErrorMessage = (
  errorCode: number | undefined,
): ErrorMessage => {
  switch (errorCode) {
    case -32000:
      return ErrorMessage.NOT_ENOUGH_ETHER;
    case 3:
      return ErrorMessage.NOT_ENOUGH_ETHER;
    case 4001:
      return ErrorMessage.DENIED_SIG;
    default:
      return ErrorMessage.SOMETHING_WRONG;
  }
};
