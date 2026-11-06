// Caps the size and shape of log arguments before they are masked in
// next-logger.config.cjs. Log-line cost grows faster than linearly with payload
// size, so keep payloads bounded and predictable.
// `.cjs` because next-logger preloads the logger config without a build step,
// and the project is `"type": "module"`.

// Per-string cap is the main knob. Sized above the longest strings this app
// logs — a CSP report's `original-policy` (~700 chars) and a viem error `.stack`
// (~800 chars) — with room for both to grow.
// Two shared caps bound a whole log line: characters for string content and
// nodes for structure. Per-string and per-key caps alone don't, since nesting
// multiplies node count, and empty strings or numbers cost no characters at all.
// Real log lines are tens of nodes (a CSP report) to a few hundred (a viem error
// with its cause chain); the node cap is sized well above that.
const MAX_STRING_LENGTH = 2 * 1024;
const MAX_TOTAL_CHARS = 16 * 1024;
const MAX_TOTAL_NODES = 1024;
const MAX_OBJECT_KEYS = 64;
const MAX_ARRAY_ITEMS = 64;
const MAX_DEPTH = 6;

const BUDGET_EXCEEDED = '[log budget exceeded]';

const clampArgs = (args) => {
  const budget = { chars: MAX_TOTAL_CHARS, nodes: MAX_TOTAL_NODES };

  const isExhausted = () => budget.chars <= 0 || budget.nodes <= 0;

  // One marker per cut subtree, charged like any other string, so the output
  // cannot grow past the budgets through markers alone.
  const cutMarker = (remaining, unit) => {
    budget.chars -= BUDGET_EXCEEDED.length;
    return `${BUDGET_EXCEEDED}: ${remaining} more ${unit}`;
  };

  const clampString = (value) => {
    if (budget.chars <= 0) {
      budget.chars -= BUDGET_EXCEEDED.length;
      return BUDGET_EXCEEDED;
    }

    const limit = Math.min(MAX_STRING_LENGTH, budget.chars);

    if (value.length <= limit) {
      budget.chars -= value.length;
      return value;
    }

    budget.chars -= limit;

    return `${value.slice(0, limit)}…[truncated ${value.length - limit} chars]`;
  };

  const clamp = (value, depth, seen) => {
    // Every visited value is a node: strings, numbers, containers alike.
    if (budget.nodes <= 0) return BUDGET_EXCEEDED;
    budget.nodes -= 1;

    if (typeof value === 'string') return clampString(value);
    if (value === null || typeof value !== 'object') return value;
    if (seen.has(value)) return '[Circular]';
    if (depth >= MAX_DEPTH) return '[MaxDepth]';

    seen.add(value);

    try {
      // Masking walks an Error's own `message`/`stack`, so cap them too. Errors
      // already reach the sink as plain objects — no behaviour change here.
      if (value instanceof Error) {
        const clamped = {
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
        const items = [];
        const shown = Math.min(value.length, MAX_ARRAY_ITEMS);

        for (let i = 0; i < shown; i++) {
          if (isExhausted()) {
            items.push(cutMarker(value.length - i, 'items'));
            return items;
          }
          items.push(clamp(value[i], depth + 1, seen));
        }

        if (value.length > shown) {
          items.push(`[truncated ${value.length - shown} items]`);
        }

        return items;
      }

      const keys = Object.keys(value);
      const clamped = {};
      const shown = Math.min(keys.length, MAX_OBJECT_KEYS);

      for (let i = 0; i < shown; i++) {
        if (isExhausted()) {
          clamped['[truncated]'] = cutMarker(keys.length - i, 'keys');
          return clamped;
        }
        clamped[clampString(keys[i])] = clamp(value[keys[i]], depth + 1, seen);
      }

      if (keys.length > shown) {
        clamped['[truncated]'] = `${keys.length - shown} more keys`;
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

module.exports = {
  clampArgs,
  MAX_STRING_LENGTH,
  MAX_TOTAL_CHARS,
  MAX_TOTAL_NODES,
  MAX_OBJECT_KEYS,
  MAX_ARRAY_ITEMS,
  MAX_DEPTH,
};
