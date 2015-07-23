"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/areas",
		defaults: {
			code: null,
			name: null,
			level: null,
			parent: null,
		},
		idAttribute: "code",
	});
});