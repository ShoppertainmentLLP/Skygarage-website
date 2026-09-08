# syntax=docker/dockerfile:1

# Astro runs as a Node server here (output: 'server' + @astrojs/node standalone), so this
# builds a plain Node image. It works unchanged on Fly, Railway, Render or any VPS.
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
# PUBLIC_* values are inlined into the bundle by Vite at build time, so they have to be
# present *here*. DATABASE_URL and ADMIN_PASSWORD are read at runtime and must not be.
ARG PUBLIC_WHATSAPP_NUMBER
ARG PUBLIC_PHONE_NUMBER
ENV PUBLIC_WHATSAPP_NUMBER=$PUBLIC_WHATSAPP_NUMBER \
    PUBLIC_PHONE_NUMBER=$PUBLIC_PHONE_NUMBER
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
# Everything is owned by `node`, otherwise running `pnpm db:push` as that user fails when
# pnpm tries to chmod the root-owned bin shims.
RUN chown node:node /app
# Dev dependencies are kept so `pnpm db:push` and `pnpm db:seed` can be run as one-off
# commands against the deployed database.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml drizzle.config.ts ./
COPY --chown=node:node src/db ./src/db
EXPOSE 4321
USER node
CMD ["node", "dist/server/entry.mjs"]
