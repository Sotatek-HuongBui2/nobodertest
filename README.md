## Description

This is project folder of Noborderz API

If you running docker in localhost:
Domain
  - API: localhost:8083
  - DB: localhost:3377
## Installation

```bash
# build docker
cp .env.example .env
cp bin/local/docker-compose.yml.local docker-compose.yml
cp bin/local/Dockerfile.local Dockerfile
docker network create noborderz-common-network
docker-compose up -d --build

# install node_modules inside docker 
docker exec -it noborderz_be bash
npm i
npm run build
npm run migration:run
npm run seed:run

```

## Running the app

```bash
# connect to docker
docker exec -it noborderz_be bash

# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
