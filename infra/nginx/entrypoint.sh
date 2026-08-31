#!/bin/sh
# Startup jobs that derive from container env vars at boot — all let the
# same image artifact serve different environments (Hoodi, Sepolia,
# Mainnet) from different Helm releases with identical builds:
#
# 1. Write /var/cache/nginx/window-env.json — plain JSON runtime env for
#    the SPA, spliced into the window-env data element of every HTML
#    response by nginx SSI (see default.conf.template). WHICH env vars go
#    in is not this script's knowledge: the build emits
#    window-env-manifest.txt from config/client-env-manifest.ts (the single
#    source of truth) and the loop below just follows it. The data element
#    is NOT executable; the fixed loader script that parses it into
#    window.__env__ ships in the build, already CSP-hashed there
#    (scripts/vite/window-env-plugin.ts) — nothing executable is generated
#    at boot, so no hashing tools in this image.
# 2. Render nginx config templates, substituting ${SELF_ORIGIN} (feeds the
#    sub_filter that resolves __PUBLIC_ORIGIN__ in served HTML/XML/TXT)
#    and the CSP header assembled from CSP_* env vars.

set -eu

# Overridable for the out-of-container test harness only — in the image
# these are always the defaults.
HTML_ROOT="${HTML_ROOT:-/usr/share/nginx/html}"
CACHE_DIR="${CACHE_DIR:-/var/cache/nginx}"
mkdir -p "$CACHE_DIR"

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
# Env reaches the SPA inside the HTML response (SSI include), NOT as the
# former stable-URL /runtime/window-env.js file: that file cached
# independently of the bundle and skewed against it (new bundle + old env —
# the missing-isProd banner incident). Server-side inclusion keeps env
# atomic with the response — a cached copy is old-but-consistent, never a
# mix — and the JSON below never crosses a config-string or sed layer, so
# only JSON-level escaping is needed.

# JSON string escaping. `<` additionally becomes the < escape (still
# valid JSON) so no value can smuggle `</script>` — or an SSI directive —
# into the raw-text script element the JSON is included into. Control chars are
# never legit in these values — drop them. Mirrors windowEnvPayload() in
# scripts/vite/window-env-plugin.ts.
jesc() {
  printf '%s' "$1" | tr -d '\000-\037' | sed \
    -e 's/\\/\\\\/g' \
    -e 's/"/\\"/g' \
    -e 's/</\\u003C/g'
}

# The env list, emitted by the build from config/client-env-manifest.ts.
# Line format: <jsonKey> <value|presence> <ENV_VAR>.
#   value    — ship the env var's content (unset/empty → key omitted,
#              browser-side fallbacks apply);
#   presence — ship only "true"/"false" (the value itself, e.g. an api-pod
#              file path, must never reach the browser).
WINDOW_ENV_MANIFEST="$HTML_ROOT/window-env-manifest.txt"
if [ ! -f "$WINDOW_ENV_MANIFEST" ]; then
  echo "entrypoint: ERROR: ${WINDOW_ENV_MANIFEST} missing — the build did not emit the env manifest" >&2
  exit 1
fi

WINDOW_ENV_JSON="{"
SEP=""
while IFS=' ' read -r key kind envName; do
  [ -n "$key" ] || continue
  # the manifest is a build artifact — reject anything but the expected
  # shape rather than interpolate surprises into JSON keys
  if ! printf '%s %s %s' "$key" "$kind" "$envName" |
    grep -Eq '^[A-Za-z0-9]+ (value|presence) [A-Z0-9_]+$'; then
    echo "entrypoint: ERROR: malformed manifest line: '$key $kind $envName'" >&2
    exit 1
  fi
  val="$(printenv "$envName" || true)"
  if [ "$kind" = "presence" ]; then
    if [ -n "$val" ]; then val="true"; else val="false"; fi
  elif [ -z "$val" ]; then
    continue
  fi
  WINDOW_ENV_JSON="${WINDOW_ENV_JSON}${SEP}\"${key}\":\"$(jesc "$val")\""
  SEP=","
done < "$WINDOW_ENV_MANIFEST"
WINDOW_ENV_JSON="${WINDOW_ENV_JSON}}"

printf '%s' "$WINDOW_ENV_JSON" > "$CACHE_DIR/window-env.json"

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
# Build-time CSP hash of the window-env LOADER script (fixed content,
# injected into the HTML by scripts/vite/window-env-plugin.ts, which emits
# this file alongside it). Unlike the import map's fail-open, a blocked
# loader means NO env at all → config/dynamics.ts throws → blank app, so a
# missing hash is fatal exactly when CSP is enforcing; malformed is fatal
# always (packaging bug or tampering).
WINDOW_ENV_HASH_FILE="$HTML_ROOT/window-env-csp-hash.txt"
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
