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

	models.AreaSingle = models.Area.extend({urlRoot: "api.php/areas"});

	// TODO: Pagination
	collections.Area = Backbone.Collection.extend({
		model: models.Area,
		url: "api.php/areas",
		parse: function(data) {
			return data.data;
		},
	});
})();