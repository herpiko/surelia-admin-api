test-user:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--harmony \
		--timeout 10000 \
		endpoints/users/test.js

admin:
	node --harmony resources/user/fixtures/seed.js

.PHONY: test-user
