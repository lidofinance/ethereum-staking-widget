export const isClientSide = () => {
  return typeof window !== 'undefined';
};
