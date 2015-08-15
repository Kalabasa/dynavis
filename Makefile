all: css/index.css css/app.css css/admin.css css/login.css js-build/
clean:
	rm css/app.css css/admin.css css/login.css
	rm -r js-build/

css/index.css: scss/index.scss scss/_*
	scss scss/index.scss css/index.css

css/app.css: scss/app.scss scss/_*
	scss scss/app.scss css/app.css

css/admin.css: scss/admin.scss scss/_*
	scss scss/admin.scss css/admin.css

css/login.css: scss/login.scss scss/_*
	scss scss/login.scss css/login.css

js-build/: $(shell find js-src/)
	mkdir -p js-build/
	cp -r -t js-build/ js-src/*
	jsx --harmony --extension jsx js-src/ js-build/
	find js-build/ -type f -name "*.js" -print0 | xargs -0 sed -i 's/jsx!//g'
	find js-build/ -type f -name "*.jsx" -delete
