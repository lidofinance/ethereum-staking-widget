#!/bin/sh
# Startup jobs that derive from container env vars at boot — all let the
# same image artifact serve different environments (Hoodi, Sepolia,
# Mainnet) from different Helm releases with identical builds:
#
# 1. Write /usr/share/nginx/html/runtime/window-env.js — read by the SPA
#    before the main bundle evals (window.__env__; see config/dynamics.ts).
# 2. Render nginx config templates, substituting ${SELF_ORIGIN} (feeds the
#    sub_filter that resolves __PUBLIC_ORIGIN__ in served HTML/XML/TXT)
#    and the CSP header assembled from CSP_* env vars.

set -eu

# --- guardrails ------------------------------------------------------------
# SELF_ORIGIN lands inside a sed replacement and a CSP header: an empty
# value silently produces relative og:image/canonical URLs (broken link
# unfurls), and `|`/`&`/newlines would corrupt the rendered config.
SELF_ORIGIN="${SELF_ORIGIN:-}"
if [ -z "$SELF_ORIGIN" ]; then
  echo "entrypoint: WARNING: SELF_ORIGIN is empty — head/sitemap URLs will be relative" >&2
fi
# NB: the newline pattern must be a literal — `$(printf '\n')` strips the
# trailing newline and degrades the pattern to `*""*`, matching EVERYTHING.
NL='
'
case "$SELF_ORIGIN" in
  *'|'* | *'&'* | *"$NL"*)
    echo "entrypoint: ERROR: SELF_ORIGIN contains forbidden characters (| & or newline)" >&2
    exit 1
    ;;
esac

# --- 1. runtime env for the SPA ---------------------------------------------
OUT_DIR="/usr/share/nginx/html/runtime"
mkdir -p "$OUT_DIR"

# addressApiValidationEnabled mirrors env-dynamics.mjs:
# `!!process.env.VALIDATION_SERVICE_BASE_PATH`.
if [ -n "${VALIDATION_SERVICE_BASE_PATH:-}" ]; then
  ADDRESS_API_VALIDATION="true"
else
  ADDRESS_API_VALIDATION="false"
fi

# useConfigManifestFile mirrors env-dynamics.mjs:
# `Boolean(process.env.CONFIG_MANIFEST_PATH)`. On the web pod the path value
# itself is unused (the file lives on the api pod) — presence toggles the SPA
# to fetch the manifest from /api/config-manifest instead of github raw.
if [ -n "${CONFIG_MANIFEST_PATH:-}" ]; then
  USE_CONFIG_MANIFEST_FILE="true"
else
  USE_CONFIG_MANIFEST_FILE="false"
fi

cat > "$OUT_DIR/window-env.js" <<EOF
window.__env__ = {
  ipfsMode: "false",
  selfOrigin: "${SELF_ORIGIN}",
  rootOrigin: "${ROOT_ORIGIN:-}",
  docsOrigin: "${DOCS_ORIGIN:-}",
  helpOrigin: "${HELP_ORIGIN:-}",
  researchOrigin: "${RESEARCH_ORIGIN:-}",
  blogOrigin: "${BLOG_ORIGIN:-}",
  defaultChain: "${DEFAULT_CHAIN:-}",
  supportedChains: "${SUPPORTED_CHAINS:-}",
  manifestOverride: "${MANIFEST_OVERRIDE:-}",
  prefillUnsafeElRpcUrls1: "${PREFILL_UNSAFE_EL_RPC_URLS_1:-}",
  prefillUnsafeElRpcUrls17000: "${PREFILL_UNSAFE_EL_RPC_URLS_17000:-}",
  prefillUnsafeElRpcUrls560048: "${PREFILL_UNSAFE_EL_RPC_URLS_560048:-}",
  prefillUnsafeElRpcUrls11155111: "${PREFILL_UNSAFE_EL_RPC_URLS_11155111:-}",
  prefillUnsafeElRpcUrls10: "${PREFILL_UNSAFE_EL_RPC_URLS_10:-}",
  prefillUnsafeElRpcUrls11155420: "${PREFILL_UNSAFE_EL_RPC_URLS_11155420:-}",
  prefillUnsafeElRpcUrls130: "${PREFILL_UNSAFE_EL_RPC_URLS_130:-}",
  prefillUnsafeElRpcUrls1301: "${PREFILL_UNSAFE_EL_RPC_URLS_1301:-}",
  enableQaHelpers: "${ENABLE_QA_HELPERS:-}",
  walletconnectProjectId: "${WALLETCONNECT_PROJECT_ID:-}",
  matomoHost: "${MATOMO_URL:-}",
  ethAPIBasePath: "${ETH_API_BASE_PATH:-}",
  wqAPIBasePath: "${WQ_API_BASE_PATH:-}",
  rewardsBackendBasePath: "${REWARDS_BACKEND_BASE_PATH:-}",
  devnetOverrides: "${DEVNET_OVERRIDES:-}",
  addressApiValidationEnabled: "${ADDRESS_API_VALIDATION}",
  validationFilePath: "${VALIDATION_FILE_PATH:-}",
  useConfigManifestFile: "${USE_CONFIG_MANIFEST_FILE}"
};
EOF

# --- 2. CSP header -----------------------------------------------------------
# Directives ported from the legacy config/csp/index.ts (next-secure-headers
# is gone with Next). The sha256 hash allows the lido-ui cookie-theme inline
# script; frame-ancestors * keeps wallet embeds (Ledger Live, Safe) working.
CSP_TRUSTED="$(printf '%s' "${CSP_TRUSTED_HOSTS:-}" | tr ',' ' ')"

CSP_VALUE="default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.reown.com; img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com; script-src 'self' 'sha256-wTvVT3oJ2rMAqNUILvSYccTn53N47S3NIZbPE0ql0No=' ${CSP_TRUSTED}; connect-src 'self' https: wss:; frame-ancestors *; frame-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com; child-src 'self' https://*.walletconnect.org https://*.walletconnect.com; worker-src 'none'; object-src 'none'; media-src 'self'; manifest-src 'self'; form-action 'self'; script-src-attr 'none'; base-uri 'none'"

if [ -n "${CSP_REPORT_URI:-}" ]; then
  CSP_VALUE="${CSP_VALUE}; report-uri ${CSP_REPORT_URI}"
fi

if [ "${CSP_REPORT_ONLY:-}" = "true" ]; then
  CSP_HEADER_NAME="content-security-policy-report-only"
else
  CSP_HEADER_NAME="content-security-policy"
fi

# --- 3. render nginx config templates ---------------------------------------
# Our own sed instead of the image's 20-envsubst-on-templates.sh: that
# script only `-w`-checks its output dir and doesn't create it, and
# /var/cache/nginx/conf.d doesn't exist until we mkdir it here.
CONF_DIR="/var/cache/nginx/conf.d"
mkdir -p "$CONF_DIR"

render() {
  sed \
    -e "s|\${SELF_ORIGIN}|${SELF_ORIGIN}|g" \
    -e "s|\${CSP_HEADER_NAME}|${CSP_HEADER_NAME}|g" \
    -e "s|\${CSP_HEADER_VALUE}|${CSP_VALUE}|g" \
    "$1" > "$2"
}

render /etc/nginx/template-src/security-headers.conf.template \
  /var/cache/nginx/security-headers.conf
render /etc/nginx/template-src/default.conf.template \
  "$CONF_DIR/default.conf"
