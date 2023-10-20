test:
	yarn test

test.coverage:
	yarn test:cov

publish.legacy:
	yarn publish --tag legacy

.PHONY: test
