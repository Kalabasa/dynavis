"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/users",
		defaults: {
			active: null,
			username: null,
			role: null,
		},
		idAttribute: "username",
		parse: function(r,o) {
			return {
				active: r.active != "0",
				username: r.username,
				role: r.role,
			};
		},
	});
});