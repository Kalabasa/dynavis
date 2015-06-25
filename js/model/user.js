"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.User = Backbone.Model.extend({
		defaults: {
			username: null,
			role: null,
		},
		idAttribute: "username",
	});

	models.UserSingle = models.User.extend({urlRoot: "api.php/users"});

	collections.User = Backbone.Collection.extend({
		model: models.User,
		url: "api.php/users",
		parse: function(data) {
			return data.data;
		},
	});
})();