import type { API } from '@lidofinance/next-api-wrapper';

/**
 * Handler for `/api/csp-report`. Nests payload under `violation` (never spread)
 * so user-controlled keys cannot shadow the `type` log discriminator. Parses
 * string bodies in try/catch and always answers 200 — a 500 would poison
 * telemetry.
 *
 * Separate file: lets tests import without pulling in `utilsApi`'s ESM chain.
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
