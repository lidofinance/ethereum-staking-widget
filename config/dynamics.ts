import * as dynamics from 'env-dynamics.mjs';
// We're making dynamic env variables
// so we can inject selected envs from Docker runtime too,
// not only during build-time for static pages

declare global {
  interface Window {
    __env__: typeof dynamics;
  }
}

// Not use dynamics directly!
// Only through:
// code```
//    import { getConfig } from 'config';
//    or import { getConfig } from './get-config';
//    const { ... } = getConfig();
// ```
export default typeof window !== 'undefined' ? window.__env__ : dynamics;
