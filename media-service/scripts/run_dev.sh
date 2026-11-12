#!/usr/bin/env bash

echo "Starting media-service in dev mode..."

# Правильная загрузка .env
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi

air