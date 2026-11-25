// Every `EL_RPC_URLS_<chainId>` variable, whatever chains are configured: the
// list is not maintained by hand because a chain added elsewhere but missed
// here would log its provider keys in clear. viem strips only basic-auth
// credentials from error messages; keys in the path or query are not, and
// short ones escape satanizer's generic patterns.
export const RPC_URL_ENV_KEY = /^EL_RPC_URLS_\d+$/;

// Comma-split so each URL becomes its own pattern; otherwise satanizer only
// matches the full concatenation.
export const getRpcUrlPatterns = (
  env: Record<string, string | undefined> = process.env,
): string[] =>
  Object.keys(env)
    .filter((key) => RPC_URL_ENV_KEY.test(key))
    .flatMap((key) =>
      (env[key] || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
    );
