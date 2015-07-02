"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/parties",
		defaults: {
			name: null,
		},
	});
});