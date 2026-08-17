export const sanitizeError = (error) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { name: 'NonError', message: error };
  }

  return { name: 'NonError', message: `Unexpected thrown value: ${typeof error}` };
};
