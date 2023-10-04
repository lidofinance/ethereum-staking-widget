# build env
FROM node:16-alpine as build

WORKDIR /app

RUN apk add --no-cache git=~2
COPY package.json yarn.lock ./

ARG CSP_REPORT_ONLY=false
ARG CSP_TRUSTED_HOSTS
ARG CSP_REPORT_URI

RUN yarn install --frozen-lockfile --non-interactive --ignore-scripts && yarn cache clean
COPY . .
RUN yarn typechain && \
    CSP_REPORT_ONLY=$CSP_REPORT_ONLY \
    CSP_TRUSTED_HOSTS=$CSP_TRUSTED_HOSTS \
    CSP_REPORT_URI=$CSP_REPORT_URI \
    NODE_NO_BUILD_DYNAMICS=true \
     yarn build
# public/runtime is used to inject runtime vars; it should exist and user node should have write access there for it
RUN rm -rf /app/public/runtime && mkdir /app/public/runtime && chown node /app/public/runtime

# final image
FROM node:16-alpine as base


ENV NEXT_TELEMETRY_DISABLED=1 \
  BASE_PATH=$BASE_PATH \
  SUPPORTED_CHAINS=$SUPPORTED_CHAINS \
 DEFAULT_CHAIN=$DEFAULT_CHAIN \
 CSP_REPORT_ONLY=$CSP_REPORT_ONLY

WORKDIR /app
RUN apk add --no-cache curl=~8
COPY --from=build /app /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["yarn", "start"]
