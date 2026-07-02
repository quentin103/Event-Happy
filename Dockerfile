# syntax=docker/dockerfile:1

##########  Image de base commune  ##########
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

##########  Dépendances  ##########
# On copie aussi prisma/ car le postinstall lance `prisma generate`.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

##########  Build  ##########
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Produit .next/standalone (serveur minimal) grâce à output: "standalone"
RUN npm run build

##########  Image d'exécution  ##########
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

# Répertoire des images (volume), accessible en écriture par "node".
RUN mkdir -p /data/uploads && chown -R node:node /data

# Application autonome
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Prisma : schéma, migrations, CLI + client pour `migrate deploy` au démarrage
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER node
EXPOSE 3000
VOLUME ["/data"]

# Applique les migrations puis démarre le serveur
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
