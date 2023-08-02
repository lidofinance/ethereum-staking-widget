export const maxNumberValidation = (input: string) => {
  if (Number.isNaN(Number(input))) return '0';
  if (Number.isFinite(input)) return '0';
  if (Math.abs(Number(input)) > Number.MAX_SAFE_INTEGER)
    return String(Number.MAX_SAFE_INTEGER);

  return input;
};
