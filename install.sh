#!/bin/bash

docker run \
  -ti \
  -e NODE_ENV=development \
  -v "$(pwd):/app" \
  node:latest \
  sh -c "cd /app/app && npm i && cd /app/front && npm i"
