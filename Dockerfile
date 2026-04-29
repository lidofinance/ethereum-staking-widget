FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git=~2

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --ignore-scripts && yarn cache clean

COPY . .

ENV NODE_OPTIONS=--max-old-space-size=6144
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /app/dist /app/public/runtime /app/.next/cache \
  && rm -rf /app/public/runtime/* \
  && chmod 0777 /app/dist /app/public/runtime /app/.next /app/.next/cache \
  && chmod +x /app/infra/api/entrypoint.sh /app/infra/scheduler/entrypoint.sh

RUN yarn build
RUN yarn build:api
RUN yarn build:scheduler

CMD ["/app/infra/api/entrypoint.sh"]
