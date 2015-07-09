all: css/main.css css/admin.css

css/main.css: scss/main.scss $(filter-out scss/main.scss, scss/*)
	scss scss/main.scss css/main.css

css/admin.css: scss/admin.scss $(filter-out scss/admin.scss, scss/*)
	scss scss/admin.scss css/admin.css