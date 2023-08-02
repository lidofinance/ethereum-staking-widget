export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error instanceof Object && 'message' in error)
    return error['message'] as string;
  return 'Something went wrong';
};
