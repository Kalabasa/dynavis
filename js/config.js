"use strict";
require.config({
	baseUrl: "js",

	paths: {
		"backbone": "lib/backbone",
		"backbone-pagec": "lib/backbone-pagec",
		"bloodhound": "lib/bloodhound",
		"bootstrap": "lib/bootstrap.min",
		"config.map": "config.map",
		"jquery": "lib/jquery-2.1.4.min",
		"jsx": "lib/jsx",
		"JSXTransformer": "lib/JSXTransformer",
		"leaflet": "lib/leaflet",
		"localStorage": "lib/localStorage",
		"minivents": "lib/minivents.min",
		"multithread": "lib/multithread.singleton",
		"multithread.lib": "lib/multithread",
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
			deps: ["backbone"],
			exports: "Backbone.PageableCollection"
		},
		"bootstrap": {
			deps: ["jquery"],
		},
		"JSXTransformer": "JSXTransformer",
		"localStorage": {
			exports: "localStorage"
		},
		"minivents": {
			exports: "Events"
		},
		"multithread.lib": {
			exports: "Multithread"
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

requirejs.onError = function (err) {
	console.error(err);
	if (err.requireType === 'timeout') {
		console.error('modules: ' + err.requireModules);
	}
};