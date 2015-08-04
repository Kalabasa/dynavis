"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/parties",
		defaults: {
			name: null,
		},
		parse: function(r,o) {
			return {
				id: parseInt(r.id, 10),
				name: r.name,
			};
		},
	});
});