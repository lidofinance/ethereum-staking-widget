/* eslint-disable import/export */
// Webpack alias target for 'zod' (see next.config.mjs resolve.alias).
// Applies jitless config as a side-effect on first import, before any schema
// parsing can happen anywhere in the bundle.
import { z } from 'zod/v4';

z.config({ jitless: true });

export * from 'zod/v4';
export { z };
export default z;
