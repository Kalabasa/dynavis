"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Party = Backbone.Model.extend({
		defaults: {
			name: null,
		},
	});

	models.PartySingle = models.Party.extend({urlRoot: "api.php/parties"});

	// TODO: Pagination
	collections.Party = Backbone.Collection.extend({
		model: models.Party,
		url: "api.php/parties",
		parse: function(data) {
			return data.data;
		},
	});
})();