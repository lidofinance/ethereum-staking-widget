# Alpine is pinned so the same source produces the same base layer over time.
ARG ALPINE_VERSION=3.24

# Full dependency tree. Kept in its own stage so editing source does not
# re-install. --mode=skip-build: the optional native modules (bufferutil,
# utf-8-validate, keccak, unrs-resolver) have no toolchain here and are not
# needed at runtime.
FROM node:24-alpine${ALPINE_VERSION} AS deps

WORKDIR /app

# .yarn/releases is the committed yarn pinned by yarnPath in .yarnrc.yml;
# the stock Yarn 1 from the node image delegates to it — no corepack needed
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases

RUN yarn install --immutable --mode=skip-build && yarn cache clean --all

# Production-only tree for the final image. Independent of `deps` (it needs the
# manifests only) so BuildKit builds both installs in parallel. The root
# postinstall is husky, a devDependency — drop it so the install does not fail.
FROM node:24-alpine${ALPINE_VERSION} AS prod-deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases

RUN node -e "const p=require('./package.json'); delete p.scripts.postinstall; require('fs').writeFileSync('package.json', JSON.stringify(p, null, 2))" \
  && YARN_ENABLE_SCRIPTS=false yarn workspaces focus --production --all \
  && yarn cache clean --all

FROM node:24-alpine${ALPINE_VERSION} AS build

# Passed by the Harbor build workflow; empty elsewhere, which leaves the
# REPLACE_WITH_* placeholders in build-info.json untouched.
ARG BUILD_VERSION=
ARG BUILD_BRANCH=
ARG BUILD_COMMIT=

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN if [ -n "$BUILD_VERSION" ]; then sed -i "s|REPLACE_WITH_VERSION|$BUILD_VERSION|" build-info.json; fi \
  && if [ -n "$BUILD_BRANCH" ]; then sed -i "s|REPLACE_WITH_BRANCH|$BUILD_BRANCH|" build-info.json; fi \
  && if [ -n "$BUILD_COMMIT" ]; then sed -i "s|REPLACE_WITH_COMMIT|$BUILD_COMMIT|" build-info.json; fi

RUN NODE_NO_BUILD_DYNAMICS=true yarn build

# final image
FROM node:24-alpine${ALPINE_VERSION} AS base

ARG BASE_PATH=""
ARG SUPPORTED_CHAINS="1"
ARG DEFAULT_CHAIN="1"

ENV NEXT_TELEMETRY_DISABLED=1 \
  BASE_PATH=$BASE_PATH \
  SUPPORTED_CHAINS=$SUPPORTED_CHAINS \
  DEFAULT_CHAIN=$DEFAULT_CHAIN

WORKDIR /app

# Production dependencies only — devDependencies never reach the final image.
COPY --from=prod-deps /app/node_modules ./node_modules
# node must own .next: ISR revalidation writes back into .next/server/pages
# wherever the root filesystem is writable (the docker/compose deploys)
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/build-info.json ./build-info.json
# Runtime entrypoints: next.config.mjs is re-evaluated by the custom server,
# pulling in scripts/ and env-dynamics. package.json for `"type": "module"`.
# No yarn at runtime: the CMD runs node directly, so the lockfile, .yarnrc.yml
# and the vendored release stay in the build stages.
COPY --from=build /app/package.json ./
COPY --from=build /app/server.mjs /app/next.config.mjs /app/env-dynamics.mjs /app/next-logger.config.cjs ./
COPY --from=build /app/scripts ./scripts

# public/runtime is where startup injects runtime env vars; the k8s chart mounts
# an emptyDir here, so the rest of the root filesystem can stay read-only
RUN rm -rf /app/public/runtime && mkdir /app/public/runtime && chown node /app/public/runtime

USER node

EXPOSE 3000

# busybox wget, so no extra apk package floats against the Alpine repos
HEALTHCHECK --interval=10s --timeout=3s \
  CMD wget -nv -t1 --spider http://localhost:3000/api/health || exit 1

# Same runner as `yarn start`, without yarn: the stock Yarn 1 launcher would be
# PID 1 and exits as soon as it forwards SIGTERM, which kills the server before
# it can drain. The script execs node, so node is PID 1 and handles the signal.
CMD ["sh", "scripts/start-prod.sh"]
