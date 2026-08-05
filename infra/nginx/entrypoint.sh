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

# JSON-string escaping for values interpolated into window-env.js — the
# build-time twin (scripts/build-dynamics.mjs) uses JSON.stringify; a raw `"`
# here would break the file for every visitor, a crafted value injects JS.
# Newlines/CRs are never legit in these values — drop them.
je() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

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

# same pattern: presence of VALIDATION_FILE_PATH enables the SPA's
# /api/validation-file fetch; the path never ships to the browser
if [ -n "${VALIDATION_FILE_PATH:-}" ]; then
  USE_VALIDATION_FILE="true"
else
  USE_VALIDATION_FILE="false"
fi

cat > "$OUT_DIR/window-env.js" <<EOF
window.__env__ = {
  ipfsMode: "false",
  selfOrigin: "$(je "${SELF_ORIGIN}")",
  rootOrigin: "$(je "${ROOT_ORIGIN:-}")",
  docsOrigin: "$(je "${DOCS_ORIGIN:-}")",
  helpOrigin: "$(je "${HELP_ORIGIN:-}")",
  researchOrigin: "$(je "${RESEARCH_ORIGIN:-}")",
  blogOrigin: "$(je "${BLOG_ORIGIN:-}")",
  defaultChain: "$(je "${DEFAULT_CHAIN:-}")",
  supportedChains: "$(je "${SUPPORTED_CHAINS:-}")",
  manifestOverride: "$(je "${MANIFEST_OVERRIDE:-}")",
  prefillUnsafeElRpcUrls1: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_1:-}")",
  prefillUnsafeElRpcUrls17000: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_17000:-}")",
  prefillUnsafeElRpcUrls560048: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_560048:-}")",
  prefillUnsafeElRpcUrls11155111: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_11155111:-}")",
  prefillUnsafeElRpcUrls10: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_10:-}")",
  prefillUnsafeElRpcUrls11155420: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_11155420:-}")",
  prefillUnsafeElRpcUrls130: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_130:-}")",
  prefillUnsafeElRpcUrls1301: "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_1301:-}")",
  enableQaHelpers: "$(je "${ENABLE_QA_HELPERS:-}")",
  walletconnectProjectId: "$(je "${WALLETCONNECT_PROJECT_ID:-}")",
  matomoHost: "$(je "${MATOMO_URL:-}")",
  ethAPIBasePath: "$(je "${ETH_API_BASE_PATH:-}")",
  wqAPIBasePath: "$(je "${WQ_API_BASE_PATH:-}")",
  rewardsBackendBasePath: "$(je "${REWARDS_BACKEND_BASE_PATH:-}")",
  devnetOverrides: "$(je "${DEVNET_OVERRIDES:-}")",
  addressApiValidationEnabled: "${ADDRESS_API_VALIDATION}",
  useValidationFile: "${USE_VALIDATION_FILE}",
  useConfigManifestFile: "${USE_CONFIG_MANIFEST_FILE}"
};
EOF

# --- 2. CSP header -----------------------------------------------------------
# Directives ported from the legacy config/csp/index.ts (next-secure-headers
# is gone with Next). The sha256 hash allows the lido-ui cookie-theme inline
# script; frame-ancestors * keeps wallet embeds (Ledger Live, Safe) working.
CSP_TRUSTED="$(printf '%s' "${CSP_TRUSTED_HOSTS:-}" | tr ',' ' ')"

# CoW origin must track features/dex-withdrawals/cowswap/consts.ts
# COWSWAP_BASE_URL — flipping IS_COWSWAP_STAGING there requires updating
# frame-src/child-src here too.
CSP_VALUE="default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.reown.com; img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com; script-src 'self' 'sha256-wTvVT3oJ2rMAqNUILvSYccTn53N47S3NIZbPE0ql0No=' ${CSP_TRUSTED}; connect-src 'self' https: wss:; frame-ancestors *; frame-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com; child-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com; worker-src 'none'; object-src 'none'; media-src 'none'; manifest-src 'self'; form-action 'self'; script-src-attr 'none'; base-uri 'none'"

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

# sed-replacement escaping: \ & and the | delimiter would otherwise corrupt
# the rendered config (a `|` in CSP_TRUSTED_HOSTS/CSP_REPORT_URI crashed the
# pod at boot, `&` — plausible in a report-uri query — inserted the matched
# pattern). CSP_HEADER_NAME is internal ("true"/"false" switch), not escaped.
se() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/[\\&|]/\\&/g'
}

render() {
  sed \
    -e "s|\${SELF_ORIGIN}|$(se "${SELF_ORIGIN}")|g" \
    -e "s|\${CSP_HEADER_NAME}|${CSP_HEADER_NAME}|g" \
    -e "s|\${CSP_HEADER_VALUE}|$(se "${CSP_VALUE}")|g" \
    "$1" > "$2"
}

render /etc/nginx/template-src/security-headers.conf.template \
  /var/cache/nginx/security-headers.conf
render /etc/nginx/template-src/default.conf.template \
  "$CONF_DIR/default.conf"
