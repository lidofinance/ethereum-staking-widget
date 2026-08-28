#!/bin/sh
# Startup jobs that derive from container env vars at boot — all let the
# same image artifact serve different environments (Hoodi, Sepolia,
# Mainnet) from different Helm releases with identical builds:
#
# 1. Assemble the base64(JSON) env payload — substituted into every HTML
#    response by nginx sub_filter (see default.conf.template) in place of
#    the `<script type="application/json" id="window-env">__WINDOW_ENV__`
#    data element. The element is NOT executable; the fixed loader script
#    that parses it into window.__env__ ships in the build, already
#    CSP-hashed there (scripts/vite/window-env-plugin.ts) — nothing
#    executable is generated at boot, so no hashing tools in this image.
# 2. Render nginx config templates, substituting ${SELF_ORIGIN} (feeds the
#    sub_filter that resolves __PUBLIC_ORIGIN__ in served HTML/XML/TXT),
#    ${WINDOW_ENV_B64}, and the CSP header assembled from CSP_* env vars.

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
# Env reaches the SPA as an inline data element, NOT as the former
# stable-URL /runtime/window-env.js file: that file cached independently of
# the bundle and skewed against it (new bundle + old env — the
# missing-isProd banner incident). Inline, env is atomic with the HTML
# response — a cached copy is old-but-consistent, never a mix.
#
# The JSON travels base64-wrapped so the bytes crossing sed render → nginx
# config string → sub_filter → HTML are alphabet-safe ([A-Za-z0-9+/=]): no
# escaping tower, nothing for nginx quote parsing, sub_filter `$var`
# interpolation, or HTML to trip on. Shape mirrors
# scripts/vite/window-env-plugin.ts windowEnvPayload() — change together.

# JSON-string escaping for values interpolated into the env JSON — the
# build-time twin (windowEnvScript) uses JSON.stringify; a raw `"` here
# would break the script for every visitor, a crafted value injects JS.
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

WINDOW_ENV_JSON=$(cat <<EOF
{
  "ipfsMode": "false",
  "isProd": "$(je "${IS_PROD:-}")",
  "selfOrigin": "$(je "${SELF_ORIGIN}")",
  "rootOrigin": "$(je "${ROOT_ORIGIN:-}")",
  "docsOrigin": "$(je "${DOCS_ORIGIN:-}")",
  "helpOrigin": "$(je "${HELP_ORIGIN:-}")",
  "researchOrigin": "$(je "${RESEARCH_ORIGIN:-}")",
  "blogOrigin": "$(je "${BLOG_ORIGIN:-}")",
  "defaultChain": "$(je "${DEFAULT_CHAIN:-}")",
  "supportedChains": "$(je "${SUPPORTED_CHAINS:-}")",
  "manifestOverride": "$(je "${MANIFEST_OVERRIDE:-}")",
  "prefillUnsafeElRpcUrls1": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_1:-}")",
  "prefillUnsafeElRpcUrls17000": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_17000:-}")",
  "prefillUnsafeElRpcUrls560048": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_560048:-}")",
  "prefillUnsafeElRpcUrls11155111": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_11155111:-}")",
  "prefillUnsafeElRpcUrls10": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_10:-}")",
  "prefillUnsafeElRpcUrls11155420": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_11155420:-}")",
  "prefillUnsafeElRpcUrls130": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_130:-}")",
  "prefillUnsafeElRpcUrls1301": "$(je "${PREFILL_UNSAFE_EL_RPC_URLS_1301:-}")",
  "enableQaHelpers": "$(je "${ENABLE_QA_HELPERS:-}")",
  "walletconnectProjectId": "$(je "${WALLETCONNECT_PROJECT_ID:-}")",
  "matomoHost": "$(je "${MATOMO_URL:-}")",
  "ethAPIBasePath": "$(je "${ETH_API_BASE_PATH:-}")",
  "wqAPIBasePath": "$(je "${WQ_API_BASE_PATH:-}")",
  "rewardsBackendBasePath": "$(je "${REWARDS_BACKEND_BASE_PATH:-}")",
  "devnetOverrides": "$(je "${DEVNET_OVERRIDES:-}")",
  "addressApiValidationEnabled": "${ADDRESS_API_VALIDATION}",
  "useValidationFile": "${USE_VALIDATION_FILE}",
  "useConfigManifestFile": "${USE_CONFIG_MANIFEST_FILE}"
}
EOF
)

# atob() decodes to latin1, so non-ASCII bytes would corrupt JSON.parse.
# None are legit in these values — strip rather than serve garbage. Also
# collapses the heredoc to printable single-line-safe ASCII (newlines and
# tabs inside JSON are insignificant whitespace, but sed/nginx strings are
# single-line, so drop them here).
WINDOW_ENV_JSON="$(printf '%s' "$WINDOW_ENV_JSON" | tr -cd '\40-\176')"

# busybox base64 wraps at 76 cols — tr strips the newlines
WINDOW_ENV_B64="$(printf '%s' "$WINDOW_ENV_JSON" | base64 | tr -d '\r\n')"
if [ -z "$WINDOW_ENV_B64" ]; then
  echo "entrypoint: ERROR: failed to base64-encode the window-env payload" >&2
  exit 1
fi

# --- 2. CSP header -----------------------------------------------------------
# Directives ported from the legacy config/csp/index.ts (next-secure-headers
# is gone with Next). frame-ancestors * keeps wallet embeds (Ledger Live,
# Safe) working. NB: the legacy lido-ui cookie-theme hash ('sha256-wTvVT3oJ…')
# is gone — the Vite SPA has no such inline script (theme init runs inside
# the bundle).
CSP_TRUSTED="$(printf '%s' "${CSP_TRUSTED_HOSTS:-}" | tr ',' ' ')"

# Per-build CSP source for the inline import map through which
# vite-plugin-sri-gen delivers module-graph SRI (its content — and hash —
# changes every build). Written by emit-import-map-csp-hash in
# vite.config.ts. Without it an enforcing CSP blocks the import map and
# module-graph integrity silently disappears (the app keeps working,
# unverified — fail-open), so a missing hash is fatal exactly when CSP is
# enforcing; a malformed one is fatal always (packaging bug or tampering).
IMPORT_MAP_HASH_FILE="/usr/share/nginx/html/importmap-csp-hash.txt"
IMPORT_MAP_HASH=""
if [ -f "$IMPORT_MAP_HASH_FILE" ]; then
  IMPORT_MAP_HASH="$(tr -d '\r\n' < "$IMPORT_MAP_HASH_FILE")"
  if ! printf '%s' "$IMPORT_MAP_HASH" | grep -Eq '^sha256-[A-Za-z0-9+/]{43}=$'; then
    echo "entrypoint: ERROR: malformed ${IMPORT_MAP_HASH_FILE}" >&2
    exit 1
  fi
fi
if [ -z "$IMPORT_MAP_HASH" ]; then
  if [ "${CSP_REPORT_ONLY:-}" = "true" ]; then
    echo "entrypoint: WARNING: ${IMPORT_MAP_HASH_FILE} missing — an enforcing CSP would block the SRI import map" >&2
  else
    echo "entrypoint: ERROR: ${IMPORT_MAP_HASH_FILE} missing — enforcing CSP would silently disable module-graph SRI" >&2
    exit 1
  fi
fi
# Build-time CSP hash of the window-env LOADER script (fixed content,
# injected into the HTML by scripts/vite/window-env-plugin.ts, which emits
# this file alongside it). Unlike the import map's fail-open, a blocked
# loader means NO env at all → config/dynamics.ts throws → blank app, so a
# missing hash is fatal exactly when CSP is enforcing; malformed is fatal
# always (packaging bug or tampering).
WINDOW_ENV_HASH_FILE="/usr/share/nginx/html/window-env-csp-hash.txt"
WINDOW_ENV_LOADER_HASH=""
if [ -f "$WINDOW_ENV_HASH_FILE" ]; then
  WINDOW_ENV_LOADER_HASH="$(tr -d '\r\n' < "$WINDOW_ENV_HASH_FILE")"
  if ! printf '%s' "$WINDOW_ENV_LOADER_HASH" | grep -Eq '^sha256-[A-Za-z0-9+/]{43}=$'; then
    echo "entrypoint: ERROR: malformed ${WINDOW_ENV_HASH_FILE}" >&2
    exit 1
  fi
fi
if [ -z "$WINDOW_ENV_LOADER_HASH" ]; then
  if [ "${CSP_REPORT_ONLY:-}" = "true" ]; then
    echo "entrypoint: WARNING: ${WINDOW_ENV_HASH_FILE} missing — an enforcing CSP would block the window-env loader (no runtime env)" >&2
  else
    echo "entrypoint: ERROR: ${WINDOW_ENV_HASH_FILE} missing — enforcing CSP would block the window-env loader and blank the app" >&2
    exit 1
  fi
fi

SCRIPT_SRC_EXTRA=""
if [ -n "$WINDOW_ENV_LOADER_HASH" ]; then
  SCRIPT_SRC_EXTRA="'${WINDOW_ENV_LOADER_HASH}' "
fi
if [ -n "$IMPORT_MAP_HASH" ]; then
  SCRIPT_SRC_EXTRA="${SCRIPT_SRC_EXTRA}'${IMPORT_MAP_HASH}' "
fi

# CoW origin must track features/dex-withdrawals/cowswap/consts.ts
# COWSWAP_BASE_URL — flipping IS_COWSWAP_STAGING there requires updating
# frame-src/child-src here too.
CSP_VALUE="default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.reown.com; img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com; script-src 'self' ${SCRIPT_SRC_EXTRA}${CSP_TRUSTED}; connect-src 'self' https: wss:; frame-ancestors *; frame-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com; child-src 'self' https://swap.cow.fi https://*.walletconnect.org https://*.walletconnect.com; worker-src 'none'; object-src 'none'; media-src 'none'; manifest-src 'self'; form-action 'self'; script-src-attr 'none'; base-uri 'none'"

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

# NB: WINDOW_ENV_B64 is safe through se() by construction — pure base64,
# no `|`/`&`/`\` in the alphabet.
render() {
  sed \
    -e "s|\${SELF_ORIGIN}|$(se "${SELF_ORIGIN}")|g" \
    -e "s|\${WINDOW_ENV_B64}|$(se "${WINDOW_ENV_B64}")|g" \
    -e "s|\${CSP_HEADER_NAME}|${CSP_HEADER_NAME}|g" \
    -e "s|\${CSP_HEADER_VALUE}|$(se "${CSP_VALUE}")|g" \
    "$1" > "$2"
}

render /etc/nginx/template-src/security-headers.conf.template \
  /var/cache/nginx/security-headers.conf
render /etc/nginx/template-src/default.conf.template \
  "$CONF_DIR/default.conf"
