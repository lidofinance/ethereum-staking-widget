import {
  buildAndSerializeClientEnv,
  parseClientEnv,
} from './client-env-manifest';

// Configuration invariant
if (
  import.meta.env?.PROD &&
  !__IPFS_MODE__ &&
  typeof window !== 'undefined' &&
  !window.__env__
) {
  throw new Error(
    'Runtime env missing: the window-env data element was not populated',
  );
}

// Determine runtime
const isProdBrowser = typeof window !== 'undefined' && window.__env__;

// Prod runtime will have window.__env__ injected but dev and IPFS builds will have build time ENVS.
const envSource = isProdBrowser
  ? window.__env__
  : JSON.parse(buildAndSerializeClientEnv());

// Parse and validate the runtime env
const dynamics = parseClientEnv(envSource);

// Don't use dynamics directly in the project!
// Only through:
// code```
//    import { config } from 'config'; // or
//    import { config } from './get-config'; // in config "namespace"
// ```
export default dynamics;
