all: css/main.css css/admin.css css/login.css js-build/
clean:
	rm css/main.css css/admin.css css/login.css
	rm -r js-build/

css/main.css: scss/main.scss scss/_*
	scss scss/main.scss css/main.css

css/admin.css: scss/admin.scss scss/_*
	scss scss/admin.scss css/admin.css

css/login.css: scss/login.scss scss/_*
	scss scss/login.scss css/login.css

js-build/: $(shell find js-src/)
	cp -r js-src/ js-build/
	jsx --harmony --extension jsx js-build/ js-build/
	find js-build/ -type f -name "*.jsx" -delete
	find js-build/ -type f -print0 | xargs -0 sed -i 's/jsx!//g'
