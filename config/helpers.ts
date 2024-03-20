export type Modify<T, R> = Omit<T, keyof R> & R;

export const toBoolean = (val: any) => {
  return (
    val?.toLowerCase?.() === 'true' ||
    val === true ||
    Number.parseInt(val, 10) === 1
  );
};
