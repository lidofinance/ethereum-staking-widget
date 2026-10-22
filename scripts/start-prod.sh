#!/bin/sh
# The production runner. `yarn start` and the image CMD both run this file, so
# the flags cannot diverge between local and container starts.
#
# `exec` makes node replace the shell. In the container node is then PID 1 and
# receives SIGTERM itself, so scripts/shutdown.mjs can drain. Behind a package
# manager the server would not: Yarn 1 (the stock launcher of the node image)
# forwards SIGTERM and exits at once, and PID 1 exiting kills the namespace.
set -eu

export NODE_ENV=production
export COLLECT_METRICS=true
export RUN_STARTUP_CHECKS=true
export RUN_SECRET_ENV_LOGGING=true

exec node -r next-logger --no-warnings=ExperimentalWarning server.mjs
