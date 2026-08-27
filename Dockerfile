# build env
FROM node:24-alpine AS build

WORKDIR /app

RUN apk add --no-cache git=~2
# .yarn/releases is the committed yarn pinned by yarnPath in .yarnrc.yml;
# the stock Yarn 1 from the node image delegates to it — no corepack needed
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
# copy with validate_addresses JSON file
# COPY package.json yarn.lock .yarnrc.yml validate_addresses.example.json ./

RUN yarn install --immutable --mode=skip-build && yarn cache clean --all
COPY . .
RUN NODE_NO_BUILD_DYNAMICS=true yarn build
# public/runtime is used to inject runtime vars; it should exist and user node should have write access there for it
RUN rm -rf /app/public/runtime && mkdir /app/public/runtime && chown node /app/public/runtime

# final image
FROM node:24-alpine AS base

WORKDIR /app
RUN apk add --no-cache curl=~8

COPY --from=build /app /app
RUN chown -R node:node /app/.next

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["yarn", "start"]
