"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.User = Backbone.Model.extend({
		urlRoot: "api.php/users",
		defaults: {
			username: null,
			role: null,
		},
		idAttribute: "username",
	});

	collections.User = Backbone.Collection.extend({
		url: "api.php/users",
		model: models.User,
		parse: function(data) {
			return data.data;
		},
	});
})();