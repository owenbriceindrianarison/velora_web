.PHONY: up down logs shell lint build add

up:
	docker compose -f docker-compose.dev.yml up

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

shell:
	docker compose -f docker-compose.dev.yml exec web sh

lint:
	docker compose -f docker-compose.dev.yml exec -T web pnpm lint

build:
	docker compose -f docker-compose.dev.yml exec -T web pnpm build

# Usage: make add COMPONENT=button
add:
	@test -n "$(COMPONENT)" || (echo "Usage: make add COMPONENT=<name>" && exit 1)
	docker compose -f docker-compose.dev.yml exec -T web pnpm dlx shadcn@latest add $(COMPONENT)
