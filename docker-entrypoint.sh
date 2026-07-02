#!/bin/sh
set -e

# Applique les migrations Prisma en attente sur la base (DATABASE_URL) au
# démarrage du conteneur, puis lance le serveur.
echo "→ Application des migrations Prisma (prisma migrate deploy)…"
node_modules/.bin/prisma migrate deploy

echo "→ Démarrage du serveur Next.js…"
exec "$@"
