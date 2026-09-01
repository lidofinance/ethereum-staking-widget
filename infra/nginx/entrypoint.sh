#!/bin/sh
# Startup jobs that derive from container env vars at boot — all let the
# same image artifact serve different environments (Hoodi, Sepolia,
# Mainnet) from different Helm releases with identical builds:
#
# 1. Write /var/cache/nginx/window-env.json — the final client config as
#    plain JSON, spliced into every HTML response by nginx SSI. Env
#    knowledge (sources, transforms, invariants) lives in
#    config/client-env-manifest.ts; this script just runs its bundled CLI.
#    A config error exits non-zero and the pod dies at boot.
# 2. Render nginx config templates: ${SELF_ORIGIN} (feeds the
#    __PUBLIC_ORIGIN__ sub_filter) and the CSP header from CSP_* env vars.

set -eu

HTML_ROOT="/usr/share/nginx/html"
CACHE_DIR="/var/cache/nginx"
mkdir -p "$CACHE_DIR"

#------------------------------------------------------------------------------------------
#----------------------- 0. guardrails ----------------------------------------------------
#------------------------------------------------------------------------------------------


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

#------------------------------------------------------------------------------------------
#----------------------- 1. runtime client env --------------------------------------------
#------------------------------------------------------------------------------------------


# Uses the window-env CLI baked into the image to write the final client config JSON
# for inclusion in the HTML served by nginx.
WINDOW_ENV_CLI="/etc/nginx/window-env-cli.mjs"
if ! node "$WINDOW_ENV_CLI" > "$CACHE_DIR/window-env.json" ||
  [ ! -s "$CACHE_DIR/window-env.json" ]; then
  echo "entrypoint: ERROR: window-env CLI failed — refusing to serve without runtime env" >&2
  exit 1
fi

#------------------------------------------------------------------------------------------
#------------------------ 2. CSP header ---------------------------------------------------
#------------------------------------------------------------------------------------------


# Per-build hash of generated SRI import map source for the inline import map through which
# Written by emit-import-map-csp-hash in vite.config.ts
IMPORT_MAP_HASH_FILE="$HTML_ROOT/importmap-csp-hash.txt"
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
# CSP hash of the WINDOW_ENV_LOADER in scripts/vite/window-env-plugin.ts
WINDOW_ENV_LOADER_HASH="sha256-6ApUdZunJlq8fZcraTYQbcZ6XIB1F85yxMoDe+8WwAY="

# Trusted hosts for CSP script-src, comma-separated in the env var
CSP_TRUSTED_SRC_VALUE="$(printf '%s' "${CSP_TRUSTED_HOSTS:-}" | tr ',' ' ')"


# CSP trusted scripts: self, trusted hosts from env, env-loader script, and the per-build import map (if present)
CSP_SCRIPT_SRC_VALUE="'self' ${CSP_TRUSTED_SRC_VALUE} '${WINDOW_ENV_LOADER_HASH}' "
if [ -n "$IMPORT_MAP_HASH" ]; then
  CSP_SCRIPT_SRC_VALUE="${CSP_SCRIPT_SRC_VALUE}'${IMPORT_MAP_HASH}' "
fi

# Used as iframe and img src for WalletConnect 
CSP_WALLET_CONNECT_HOSTS="https://*.walletconnect.org https://*.walletconnect.com"

CSP_IFRAME_VALUE="'self' https://swap.cow.fi ${CSP_WALLET_CONNECT_HOSTS}"

CSP_VALUE="default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.reown.com; img-src 'self' data: blob: ${CSP_WALLET_CONNECT_HOSTS}; script-src ${CSP_SCRIPT_SRC_VALUE}; connect-src 'self' https: wss:; frame-ancestors *; frame-src ${CSP_IFRAME_VALUE}; child-src ${CSP_IFRAME_VALUE}; worker-src 'none'; object-src 'none'; media-src 'none'; manifest-src 'self'; form-action 'self'; script-src-attr 'none'; base-uri 'none'"

if [ -n "${CSP_REPORT_URI:-}" ]; then
  CSP_VALUE="${CSP_VALUE}; report-uri ${CSP_REPORT_URI}"
fi

if [ "${CSP_REPORT_ONLY:-}" = "true" ]; then
  CSP_HEADER_NAME="content-security-policy-report-only"
else
  CSP_HEADER_NAME="content-security-policy"
fi



#------------------------------------------------------------------------------------------
#----------------------- 3. render nginx config templates ---------------------------------
#------------------------------------------------------------------------------------------


# Our own sed instead of the image's 20-envsubst-on-templates.sh: that
# script only `-w`-checks its output dir and doesn't create it, and
# /var/cache/nginx/conf.d doesn't exist until we mkdir it here.
CONF_DIR="$CACHE_DIR/conf.d"
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
