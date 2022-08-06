docker-init:
	docker-compose up -d --build

docker-start:
	docker-compose up -d

docker-stop:
	docker-compose down

docker-connect:
	docker exec -it noborderz_be /bin/bash

build:
	npm run build

start-dev:
	npm run start:dev

start:
	npm run start

migration-dev:
	npm run migration:run

migration:
	npm run migration:run:prod

list-container:
	docker container ps -a

log-daily:
	tail -f "./application-$(shell date +"%Y-%m-%d").log"

log:
	tail -f application-error.log

deploy:
	ssh -p $(p) $(u)@$(h) "mkdir -p $(dir)"
	rsync -avhzL --delete \
				--no-perms --no-owner --no-group \
				--exclude .git \
				--exclude .logs \
				--exclude .tmp \
				--exclude .idea \
				--exclude docker \
				--exclude dist \
				--exclude package-lock.json \
				--exclude node_modules \
				--exclude db \
				. $(u)@$(h):$(dir)/

deploy-dev:
	cp bin/local/.env.local .env
	cp bin/local/docker-compose.yml.local docker-compose.yml
	cp bin/local/Dockerfile.local Dockerfile
	make deploy h=10.2.11.69 p=22 u=luandt dir=/home/luandt/mnt2/noborderz/noborderz-api
