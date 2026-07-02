# syntax=docker/dockerfile:1

##########  Base commune (Alpine + libs pour Prisma)  ##########
FROM node:22-alpine AS base
# openssl : requis par le moteur Prisma ; libc6-compat : binaires natifs sur musl
RUN apk add --no-cache libc6-compat openssl
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
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

# Utilisateur non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Répertoire des images (Railway monte un volume sur /data/uploads)
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

# Assets publics
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Application autonome (standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Client Prisma + moteur de requêtes (indispensables au runtime ; PAS la CLI ni
# les migrations — celles-ci se poussent séparément via `npm run db:migrate`).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs
EXPOSE 3000

# Pas de VOLUME : Railway rejette l'instruction et monte déjà le volume.
CMD ["node", "server.js"]
