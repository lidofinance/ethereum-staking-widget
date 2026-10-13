/**
 * Generates client ENV JSON from the current process env, for nginx to splice into every
 * HTML response.
 * Follows transforms and validations and will fail on malformed envs
 */
import { buildAndSerializeClientEnv } from '../config/client-env-manifest';

try {
  process.stdout.write(buildAndSerializeClientEnv(process.env));
} catch (err) {
  console.error(
    'window-env-cli: refusing to emit runtime env:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
}
