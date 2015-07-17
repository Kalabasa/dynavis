all: css/main.css css/admin.css

css/main.css: scss/main.scss scss/_*
	scss scss/main.scss css/main.css

css/admin.css: scss/admin.scss scss/_*
	scss scss/admin.scss css/admin.css