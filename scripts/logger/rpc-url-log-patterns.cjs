// Every `EL_RPC_URLS_<chainId>` variable, whatever chains are configured: the
// list is not maintained by hand because a chain added elsewhere (startup
// checks, secret config) but missed here would log its provider keys in clear.
// Only URL credentials in basic-auth form are stripped by viem before an error
// message is built; keys in the path or query are not, and short ones escape
// satanizer's generic patterns.
const RPC_URL_ENV_KEY = /^EL_RPC_URLS_\d+$/;

// Comma-split so each URL becomes its own pattern; otherwise satanizer only
// matches the full concatenation.
const getRpcUrlPatterns = (env = process.env) =>
  Object.keys(env)
    .filter((key) => RPC_URL_ENV_KEY.test(key))
    .flatMap((key) =>
      (env[key] || '')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
    );

module.exports = { getRpcUrlPatterns, RPC_URL_ENV_KEY };
