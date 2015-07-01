"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Area = Backbone.Model.extend({
		defaults: {
			code: null,
			name: null,
			level: null,
			parent: null,
		},
		idAttribute: "code",
	});

	models.AreaSingle = models.Area.extend({urlRoot: "api.php/areas"});

	collections.Area = Backbone.PageableCollection.extend({
		model: models.Area,
		url: "api.php/areas",
		parse: function(data) {
			return data.data;
		},
	});
})();