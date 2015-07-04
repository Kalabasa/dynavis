"use strict";
require.config({
	baseUrl: "js",

	paths: {
		"backbone": "lib/backbone",
		"backbone-pagec": "lib/backbone-pagec",
		"bloodhound": "lib/bloodhound",
		"jquery": "lib/jquery-2.1.4.min",
		"jsx": "lib/jsx",
		"JSXTransformer": "lib/JSXTransformer",
		"leaflet": "lib/leaflet",
		"localStorage": "lib/localStorage",
		"react": "lib/react",
		"react.backbone": "lib/react.backbone",
		"text": "lib/text",
		"typeahead": "lib/typeahead.jquery",
		"underscore": "lib/underscore-min",
	},

	shim : {
		"backbone": {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		"backbone-pagec": {
			deps: ['backbone'],
			exports: 'Backbone.PageableCollection'
		},
		"JSXTransformer": "JSXTransformer",
		"localStorage": {
			exports: "localStorage"
		},
		"react": {
			exports: "React"
		},
		"react.backbone": {
			deps: ["react"]
		},
		"underscore": {
			exports: "_"
		},
	},

	config: {
		jsx: {
			fileExtension: ".jsx",
		}
	},
});