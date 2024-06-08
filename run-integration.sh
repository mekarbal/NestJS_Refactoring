#!/usr/bin/env bash
DOCKER_PROJECT='merjane-test';
DOCKER_COMPOSE_PATH='./docker/docker-compose-test.yml';
TEST_ENV_FILE='.env.dev';
docker compose -p ${DOCKER_PROJECT} --env-file ${TEST_ENV_FILE} -f ${DOCKER_COMPOSE_PATH} up -d --wait
echo initial delay && sleep 1
pnpm drizzle:migrate
pnpm do:test:integration
docker compose -p ${DOCKER_PROJECT} --env-file ${TEST_ENV_FILE} -f ${DOCKER_COMPOSE_PATH} down -v
