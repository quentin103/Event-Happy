# syntax=docker/dockerfile:1

##########  Base commune (Alpine + libs pour Prisma)  ##########
FROM node:22-alpine AS base
# openssl + libc6-compat : moteur Prisma ; su-exec : drop de privilèges à l'entrée
RUN apk add --no-cache libc6-compat openssl su-exec
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

##########  1. Dépendances  ##########
FROM base AS deps
COPY package.json package-lock.json* ./
# prisma/ nécessaire : le postinstall lance `prisma generate`
COPY prisma ./prisma
RUN npm ci

##########  2. Build  ##########
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- Variables de BUILD ---
# Seules les variables NEXT_PUBLIC_* doivent être présentes au build (Next les
# inline dans le bundle client). Ce projet n'en a AUCUNE, donc rien à passer ici.
# Les variables serveur (DATABASE_URL, DATA_DIR, MAX_UPLOAD_MB, DATABASE_SSL…)
# sont lues à l'EXÉCUTION : ne pas les mettre ici (et ne jamais graver de secret
# dans une image). Exemple si un jour tu ajoutes une variable publique :
#   ARG NEXT_PUBLIC_SITE_URL
#   ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

##########  3. Production (image épurée : app + client Prisma)  ##########
FROM base AS runner

# Valeurs par défaut NON secrètes (Railway peut les surcharger dans le service).
# Les secrets/URL (DATABASE_URL, DATABASE_SSL, MAX_UPLOAD_MB…) proviennent des
# variables Railway au runtime, PAS de l'image.
ENV DATA_DIRE=/app/uploads


EXPOSE 3000

# Pas de VOLUME : Railway rejette l'instruction et monte déjà le volume.
# Pas de `USER` ici : l'entrypoint tourne en root puis bascule sur "nextjs".
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
