"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Area = Backbone.Model.extend({
		defaults: {
			area_code: null,
			name: null,
			level: null,
			parent: null,
		},
	});

	// TODO: Pagination
	collections.Area = Backbone.Collection.extend({
		url: "api.php/areas",
		model: models.Area,
		parse: function(data) {
			return data.data;
		},
	});
})();