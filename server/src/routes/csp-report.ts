import type { FastifyPluginAsync } from 'fastify';

import { methodNotAllowed } from '../utils/method-guard.js';

/**
 * Receives CSP violation reports from the browser. Ported from
 * `pages/api/csp-report.ts` + `utilsApi/csp-report-handler.ts`.
 *
 * Security notes carried over verbatim (bounty F5, 2026-05-13 baseline):
 * - Always answers 200, never 500 — a 500 would poison telemetry.
 * - Body parsed via try/catch; on parse failure log `parseError` instead
 *   of the raw bytes.
 * - Violation nested under `violation`, never spread — user-controlled keys
 *   cannot shadow the `type` log discriminator.
 *
 * Body cap: 32 KiB (CSP3 Reporting API can batch) — matches the legacy
 * `config.api.bodyParser.sizeLimit`.
 *
 * Browsers send one of two content types — both wired up:
 * - application/csp-report (CSP1/CSP2)
 * - application/reports+json (CSP3 Reporting API)
 */
const BODY_LIMIT_BYTES = 32 * 1024;

export const cspReportRoute: FastifyPluginAsync = async (fastify) => {
  for (const contentType of [
    'application/csp-report',
    'application/reports+json',
  ]) {
    fastify.addContentTypeParser(
      contentType,
      { parseAs: 'string', bodyLimit: BODY_LIMIT_BYTES },
      (_req, body, done) => {
        try {
          done(null, JSON.parse(body as string));
        } catch {
          done(null, { parseError: true, bodyLen: (body as string).length });
        }
      },
    );
  }

  fastify.post(
    '/api/csp-report',
    { bodyLimit: BODY_LIMIT_BYTES },
    async (req, reply) => {
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

      req.log.warn({ type: 'CSP Violation', violation }, 'csp-violation');
      return reply.status(200).send({ status: 'ok' });
    },
  );

  methodNotAllowed(fastify, '/api/csp-report', ['POST']);
};
