#!/bin/sh
set -e

# Le conteneur démarre en root : on garantit que le répertoire de données
# (volume Railway monté sur DATA_DIR) est accessible en écriture par
# l'utilisateur non-root, PUIS on bascule sur cet utilisateur pour lancer Next.
DIR="${DATA_DIR:-/data}"
mkdir -p "$DIR/uploads"
chown -R nextjs:nodejs "$DIR" 2>/dev/null || true

exec su-exec nextjs "$@"
