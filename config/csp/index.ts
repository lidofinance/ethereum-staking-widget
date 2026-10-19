import type { ContentSecurityPolicyOption } from 'next-secure-headers/lib/rules';
import { createContentSecurityPolicy } from 'scripts/csp/content-security-policy.mjs';

// Don't use absolute import here!
// code'''
//    import { config, secretConfig } from 'config';
// '''
// otherwise you will get something like a cyclic error!
import { config } from '../get-config';
import { secretConfig } from '../get-secret-config';
import { IPFS_BASE_SCRIPT_HASH } from 'features/ipfs';
import { COWSWAP_BASE_URL } from 'features/dex-withdrawals/cowswap/consts';

// The policy itself is plain JS under scripts/csp: the header is set by
// server.mjs on every HTML response (the pages are static, so nothing in the
// app runs per request), while this object feeds the <meta> tag of the IPFS
// build in pages/_document.tsx
export const contentSecurityPolicy: ContentSecurityPolicyOption =
  createContentSecurityPolicy({
    trustedHosts: secretConfig.cspTrustedHosts
      ? secretConfig.cspTrustedHosts.split(',')
      : [],
    reportUri: secretConfig.cspReportUri,
    reportOnly: secretConfig.cspReportOnly,
    cowswapBaseUrl: COWSWAP_BASE_URL,
    developmentMode: config.developmentMode,
    ipfsMode: config.ipfsMode,
    ipfsBaseScriptHash: IPFS_BASE_SCRIPT_HASH,
  });
