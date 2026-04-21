#!/usr/bin/env bash
set -euo pipefail

mkdir -p prisma
/usr/bin/sqlite3 prisma/dev.db < scripts/init-db.sql
