"use strict";
define(["backbone"], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: "api.php/users",
		defaults: {
			username: null,
			role: null,
		},
		idAttribute: "username",
	});
});