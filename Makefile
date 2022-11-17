LANGAME_API_KEY ?= $(shell cat .env | grep LANGAME_API_KEY | cut -d '=' -f 2)
OPENAI_KEY ?= $(shell cat .env | grep OPENAI_KEY | cut -d '=' -f 2)
OPENAI_ORG ?= $(shell cat .env | grep OPENAI_ORG | cut -d '=' -f 2)
REGION="europe-west1"

# Warn the user if no .env is found here
# using makefile syntax
ifeq (, $(shell ls .env))
$(error "No .env file found. Please create one with the appropriate variables.")
endif

fn/chat_example/deploy: ## [Local development] Deploy the function.
	gcloud functions deploy chat \
		--runtime python39 \
		--timeout 180 \
		--set-env-vars LANGAME_API_KEY=${LANGAME_API_KEY} \
		--set-env-vars OPENAI_KEY=${OPENAI_KEY} \
		--set-env-vars OPENAI_ORG=${OPENAI_ORG} \
		--trigger-http \
		--region ${REGION} \
		--allow-unauthenticated \
		--source functions/chat_example

fn/chat_example/test: ## [Local development] Test the function.
	cd functions/chat_example;\
	LANGAME_API_KEY=${LANGAME_API_KEY} OPENAI_KEY=${OPENAI_KEY} OPENAI_ORG=${OPENAI_ORG} \
		functions_framework --target=chat --debug

release: ## [Local development] Release the repo.
	read -p "Version:" VERSION; \
	echo "Releasing version $$VERSION"; \
	git add .; \
	read -p "Commit content:" COMMIT; \
	echo "Committing '$$VERSION: $$COMMIT'"; \
	git commit -m "$$VERSION: $$COMMIT"; \
	git push origin main; \
	git tag $$VERSION; \
	git push origin $$VERSION
	@echo "Done, check https://github.com/langa-me/chat-example/actions"


.PHONY: help

help: # Run `make help` to get help on the make commands
	@grep -E '^[0-9a-zA-Z\/_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
