"use strict";
require.config({
	// urlArgs: "bust=" + (new Date()).getTime(),
	
	baseUrl: "js-build",

	paths: {
		"backbone": "lib/backbone-wrapper",
		"backbone-original": "lib/backbone",
		"backbone-pagec": "lib/backbone-pagec",
		"jquery.bez": "lib/jquery.bez.min",
		"bloodhound": "lib/bloodhound",
		"bootstrap": "lib/bootstrap.min",
		"config.map": "config.map",
		"d3": "lib/d3.min",
		"jenks": "lib/jenks",
		"jquery": "lib/jquery-2.1.4.min",
		"jsx": "lib/jsx",
		"JSXTransformer": "lib/JSXTransformer",
		"leaflet": "lib/leaflet",
		"localStorage": "lib/localStorage",
		"minivents": "lib/minivents.min",
		"numf": "lib/numf",
		"react": "lib/react",
		"react.backbone": "lib/react.backbone",
		"text": "lib/text",
		"typeahead": "lib/typeahead.jquery",
		"underscore": "lib/underscore-min",
		"validator": "lib/validator",
	},

	shim : {
		"backbone": {
			exports: "Backbone"
		},
		"backbone-original": {
			deps: ["underscore", "jquery"]
		},
		"backbone-pagec": {
			deps: ["backbone"],
			exports: "Backbone.PageableCollection"
		},
		"bootstrap": { deps: ["jquery"], },
		"jenks": { exports: "jenks" },
		"JSXTransformer": "JSXTransformer",
		"localStorage": { exports: "localStorage" },
		"minivents": { exports: "Events" },
		"react": { exports: "React" },
		"react.backbone": { deps: ["react", "backbone"] },
		"underscore": { exports: "_" },
	},

	config: {
		jsx: {
			fileExtension: ".jsx",
			harmony: true,
		}
	},
});

requirejs.onError = function (err) {
	console.error(err);
	if (err.requireType === 'timeout') {
		console.error('modules: ' + err.requireModules);
	}
};