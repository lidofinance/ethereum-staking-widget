export const ROUTES = {
  api: {
    configManifest: '/api/config-manifest',
    cspReport: '/api/csp-report',
    geo: '/api/geo',
    rewards: '/api/rewards',
    rpc: '/api/rpc',
    swapOneInch: '/api/swap/one-inch',
    validation: '/api/validation',
    health: '/api/health',
    readiness: '/api/readiness',
    metrics: '/api/metrics',
  },
  health: '/health',
} as const;
