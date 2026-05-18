import type { API } from '@lidofinance/next-api-wrapper';

/**
 * Handler for `/api/csp-report`.
 *
 * Extracted from the route file so it can be unit-tested without pulling in
 * the `utilsApi` index re-export chain (which transitively imports project
 * `.mjs` ESM files that Jest can't parse without extra config).
 *
 * Defensive choices documented inline:
 * - User payload is nested under `violation`, never spread, so attacker-
 *   controlled keys (notably `type`) cannot shadow the synthetic log
 *   discriminator that downstream log shipping routes on.
 * - String bodies are parsed in try/catch — malformed input is logged as
 *   `{ parseError: true, bodyLen }` and answered with 200. This matches the
 *   services-map design intent ("must accept malformed gracefully — a 500
 *   poisons telemetry").
 */
export const cspReportHandler: API = async (req, res) => {
  let violation: unknown = {};

  if (typeof req.body === 'object' && req.body !== null) {
    violation = req.body;
  } else if (typeof req.body === 'string') {
    try {
      violation = JSON.parse(req.body);
    } catch {
      violation = { parseError: true, bodyLen: req.body.length };
    }
  }

  console.warn({ type: 'CSP Violation', violation });

  res.status(200).send({ status: 'ok' });
};
