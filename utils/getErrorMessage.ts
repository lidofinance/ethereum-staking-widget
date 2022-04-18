export const getErrorMessage = (errorCode: number | undefined) => {
  switch (errorCode) {
    case -32000:
      return 'Not enough ether for gas.';
    case 4001:
      return 'User denied    transaction signature.';
    default:
      return 'Something went wrong.';
  }
};
