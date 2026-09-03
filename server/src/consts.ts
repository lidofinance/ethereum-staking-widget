export const ROUTES = {
  api: {
    configManifest: '/api/config-manifest',
    cspReport: '/api/csp-report',
    earn: {
      vaultsApr: '/api/earn/vaults-apr',
      vaultsTvl: '/api/earn/vaults-tvl',
    },
    geo: '/api/geo',
    rewards: '/api/rewards',
    rpc: '/api/rpc',
    validation: '/api/validation',
    health: '/api/health',
    metrics: '/api/metrics',
  },
  health: '/health',
} as const;
