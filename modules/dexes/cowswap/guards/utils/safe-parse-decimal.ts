// Strict decimal parser — rejects scientific notation and partial parses
const DECIMAL_RE = /^\d{1,20}(\.\d{1,18})?$/;

export const safeParseDecimal = (
  value: string | undefined | null,
): number | null => {
  if (!value) return null;

  if (!DECIMAL_RE.test(value)) return null;

  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
