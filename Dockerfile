# syntax=docker/dockerfile:1

##########  Image de base commune  ##########
FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

##########  Dépendances  ##########
# prisma/ est copié car le postinstall lance `prisma generate`.
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

##########  Image d'exécution (épurée)  ##########
# Contient l'app + le client Prisma (moteur de requêtes) UNIQUEMENT.
# Aucun outillage base de données : ni CLI Prisma, ni schéma, ni migrations.
# Les migrations se poussent séparément (voir README / `npm run db:migrate`).
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

# Client Prisma + moteur de requêtes (indispensables à l'exécution).
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/node_modules/@prisma/client ./node_modules/@prisma/client
# on retire le moteur macOS inutile dans une image Linux
RUN rm -f node_modules/.prisma/client/libquery_engine-darwin-arm64.dylib.node

USER node
EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "server.js"]
