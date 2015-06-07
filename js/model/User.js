"use strict";

(function() {
	app.models.User = Backbone.Model.extend({
		defaults: {
			id: null,
			username: null,
			type: null,
		},
	});

	app.models.UserCollection = Backbone.Collection.extend({
		url: "api.php/users",
		model: app.models.User,
	});
})();