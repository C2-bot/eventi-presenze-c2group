#!/bin/bash
# Crea un backup datato del progetto nella cartella backups/

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/backup_${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"

# Copia i file sorgente (esclude node_modules, .git, backups)
rsync -av --exclude='node_modules' --exclude='.git' --exclude='backups' . "$BACKUP_DIR/"

echo ""
echo "Backup creato in: $BACKUP_DIR"
echo "Contenuto:"
ls -la "$BACKUP_DIR"
