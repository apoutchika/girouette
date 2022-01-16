#!/bin/bash

docker run \
  -ti \
  -e NODE_ENV=development \
  -v "$(pwd):/app" \
  node:16 \
  sh -c "cd /app/app && npm i && cd /app/front && npm i"

NETWORK_GIROUETTE=$(docker network ls --format "{{.Name}}" | grep '^girouette$' | wc -l)
[[ "${NETWORK_GIROUETTE}" == "0" ]] && docker network create girouette && echo "ok"

VOLUME_GIROUETTE=$(docker volume ls --format "{{.Name}}" | grep '^girouette$' | wc -l)
[[ "${VOLUME_GIROUETTE}" == "0" ]] && docker volume create girouette && echo "ok"

docker-compose up
