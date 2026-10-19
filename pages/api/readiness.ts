import type { NextApiRequest, NextApiResponse } from 'next';

import { getReadiness } from 'scripts/readiness.mjs';

// Kubernetes readiness target. Unlike /api/health (liveness, dependency-free
// and always 200 once the process is up) this flips to 503 while the pod is
// still starting and as soon as shutdown begins, so the endpoints controller
// drains traffic before the server stops accepting connections.
const readiness = (_req: NextApiRequest, res: NextApiResponse) => {
  const { ready, reason } = getReadiness();

  res.setHeader('Cache-Control', 'no-store');
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not-ready',
    ...(reason ? { reason } : {}),
  });
};

export default readiness;
