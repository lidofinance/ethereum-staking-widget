// Caps the size and shape of log arguments before they are masked in
// `logger.ts`. Log-line cost grows faster than linearly with payload size, so
// keep payloads bounded and predictable.

// Per-string cap is the main knob. Sized above the longest strings this app
// logs — a CSP report's `original-policy` (~700 chars) and a viem error `.stack`
// (~800 chars) — with room for both to grow.
// The total cap bounds a whole log line; per-string and per-key caps alone
// don't, since nesting multiplies node count.
export const MAX_STRING_LENGTH = 2 * 1024;
export const MAX_TOTAL_CHARS = 16 * 1024;
export const MAX_OBJECT_KEYS = 64;
export const MAX_ARRAY_ITEMS = 64;
export const MAX_DEPTH = 6;

export const clampArgs = (args: unknown[]): unknown[] => {
  const budget = { chars: MAX_TOTAL_CHARS };

  const clampString = (value: string): string => {
    if (budget.chars <= 0) return '[log budget exceeded]';

    const limit = Math.min(MAX_STRING_LENGTH, budget.chars);

    if (value.length <= limit) {
      budget.chars -= value.length;
      return value;
    }

    budget.chars -= limit;

    return `${value.slice(0, limit)}…[truncated ${value.length - limit} chars]`;
  };

  const clamp = (value: unknown, depth: number, seen: Set<object>): unknown => {
    if (typeof value === 'string') return clampString(value);
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return '[Circular]';
    if (depth >= MAX_DEPTH) return '[MaxDepth]';

    seen.add(value);

    try {
      // Masking walks an Error's own `message`/`stack`, so cap them too. Errors
      // already reach the sink as plain objects — no behaviour change here.
      if (value instanceof Error) {
        const clamped: Record<string, unknown> = {
          name: value.name,
          message: clampString(String(value.message ?? '')),
          stack: clampString(String(value.stack ?? '')),
        };
        // undici and viem hide the actionable errno here.
        if (value.cause !== undefined) {
          clamped.cause = clamp(value.cause, depth + 1, seen);
        }

        return clamped;
      }

      if (Array.isArray(value)) {
        const items: unknown[] = value
          .slice(0, MAX_ARRAY_ITEMS)
          .map((item) => clamp(item, depth + 1, seen));

        if (value.length > MAX_ARRAY_ITEMS) {
          items.push(`[truncated ${value.length - MAX_ARRAY_ITEMS} items]`);
        }

        return items;
      }

      const record = value as Record<string, unknown>;
      const keys = Object.keys(record);
      const clamped: Record<string, unknown> = {};

      for (const key of keys.slice(0, MAX_OBJECT_KEYS)) {
        clamped[clampString(key)] = clamp(record[key], depth + 1, seen);
      }

      if (keys.length > MAX_OBJECT_KEYS) {
        clamped['[truncated]'] = `${keys.length - MAX_OBJECT_KEYS} more keys`;
      }

      return clamped;
    } catch {
      // A throwing getter must never break logging.
      return '[unserializable]';
    } finally {
      // Drop on the way out so a repeated object isn't misreported as a cycle.
      seen.delete(value);
    }
  };

  return args.map((arg) => clamp(arg, 0, new Set()));
};
