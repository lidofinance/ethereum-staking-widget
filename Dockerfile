# build env
FROM node:16-alpine as build

WORKDIR /app

RUN apk add --no-cache git=2.36.1-r0
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean
COPY . .
RUN yarn typechain && yarn build

# final image
FROM node:16-alpine as base

ARG BASE_PATH=""
ARG SUPPORTED_CHAINS="1"
ARG DEFAULT_CHAIN="1"

ENV NEXT_TELEMETRY_DISABLED=1 \
  BASE_PATH=$BASE_PATH \
  SUPPORTED_CHAINS=$SUPPORTED_CHAINS \
  DEFAULT_CHAIN=$DEFAULT_CHAIN

WORKDIR /app
RUN apk add --no-cache curl=7.83.1-r1
COPY --from=build /app /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["yarn", "start"]
