all: css/main.css css/admin.css css/login.css

css/main.css: scss/main.scss scss/_*
	scss scss/main.scss css/main.css

css/admin.css: scss/admin.scss scss/_*
	scss scss/admin.scss css/admin.css

css/login.css: scss/login.scss scss/_*
	scss scss/login.scss css/login.css