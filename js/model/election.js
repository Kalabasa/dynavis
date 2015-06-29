"use strict";
var models = models || {};
var collections = collections || {};
(function() {
	models.Election = Backbone.Model.extend({
		defaults: {
			official_id: null,
			year: null,
			year_end: null,
			position: null,
			votes: null,
			area_code: null,
			party_id: null,
		},
	});

	models.ElectionSingle = models.Election.extend({urlRoot: "api.php/elections"});

	collections.Election = Backbone.PageableCollection.extend({
		model: models.Election,
		url: "api.php/elections",
		parse: function(data) {
			return data.data;
		},
	});
})();