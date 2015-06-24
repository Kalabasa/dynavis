"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Election = Backbone.Model.extend({
		defaults: {
			id: null,
			official_id: null,
			year: null,
			year_end: null,
			position: null,
			votes: null,
			area_code: null,
			party_id: null,
		},
	});

	// TODO: Pagination
	collections.Election = Backbone.Collection.extend({
		url: "api.php/elections",
		model: models.Election,
		parse: function(data) {
			return data.data;
		},
	});
})();