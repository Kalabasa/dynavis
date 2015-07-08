all: css/main.css css/admin.css

css/main.css: scss/main.scss
	scss scss/main.scss css/main.css

css/admin.css: scss/admin.scss
	scss scss/admin.scss css/admin.css