LANGAME_API_KEY ?= $(shell cat .env | grep LANGAME_API_KEY | cut -d '=' -f 2)
OPENAI_KEY ?= $(shell cat .env | grep OPENAI_KEY | cut -d '=' -f 2)
OPENAI_ORG ?= $(shell cat .env | grep OPENAI_ORG | cut -d '=' -f 2)
REGION="europe-west1"

# Warn the user if no .env is found here
# using makefile syntax
ifeq (, $(shell ls .env))
$(error "No .env file found. Please create one with the appropriate variables.")
endif

fn/suggestions/deploy: ## [Local development] Deploy the function.
	gcloud functions deploy suggestions \
		--runtime python39 \
		--timeout 180 \
		--set-env-vars LANGAME_API_KEY=${LANGAME_API_KEY} \
		--set-env-vars OPENAI_KEY=${OPENAI_KEY} \
		--set-env-vars OPENAI_ORG=${OPENAI_ORG} \
		--trigger-http \
		--region ${REGION} \
		--allow-unauthenticated \
		--source functions/suggestions

fn/suggestions/test: ## [Local development] Test the function.
	cd functions/suggestions;\
	LANGAME_API_KEY=${LANGAME_API_KEY} OPENAI_KEY=${OPENAI_KEY} OPENAI_ORG=${OPENAI_ORG} \
		functions_framework --target=suggestions --debug

.PHONY: help

help: # Run `make help` to get help on the make commands
	@grep -E '^[0-9a-zA-Z\/_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
